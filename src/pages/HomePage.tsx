import { useState, useEffect } from 'react';
import { Alert, Box, CircularProgress, Typography } from '@mui/material';
import WorkoutWizard from '../components/WorkoutWizard';
import WorkoutResult from '../components/WorkoutResult';
import Layout from '../components/Layout';
import { client } from '../lib/amplify';
import type { Exercise, WorkoutInputs } from '../types/workout';

type PageState = 'loading-profile' | 'wizard' | 'generating' | 'result' | 'error';

export default function HomePage() {
  const [pageState, setPageState] = useState<PageState>('loading-profile');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [currentInputs, setCurrentInputs] = useState<WorkoutInputs | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [profileId, setProfileId] = useState<string | null>(null);
  const [savedProfile, setSavedProfile] = useState<Partial<WorkoutInputs>>({});

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data } = await client.models.UserProfile.list();
        if (data?.length) {
          const p = data[0];
          setProfileId(p.id);
          setSavedProfile({
            birthday: p.birthday,
            gender: p.gender,
            height: p.height,
            weight: p.weight,
          });
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setPageState('wizard');
      }
    };
    loadProfile();
  }, []);

  const saveProfile = async (inputs: WorkoutInputs) => {
    const profileData = {
      birthday: inputs.birthday,
      gender: inputs.gender,
      height: inputs.height,
      weight: inputs.weight,
    };
    try {
      if (profileId) {
        await client.models.UserProfile.update({ id: profileId, ...profileData });
      } else {
        const { data } = await client.models.UserProfile.create(profileData);
        if (data) setProfileId(data.id);
      }
      setSavedProfile(profileData);
    } catch (err) {
      console.error('Failed to save profile:', err);
    }
  };

  const handleGenerate = async (inputs: WorkoutInputs) => {
    setCurrentInputs(inputs);
    setPageState('generating');
    setErrorMsg('');

    saveProfile(inputs);

    try {
      const { data, errors } = await client.queries.generateWorkout({
        inputs: JSON.stringify(inputs),
      });

      if (errors?.length) throw new Error(errors[0].message);
      if (!data) throw new Error('No response from AI');

      const parsed = JSON.parse(data) as { exercises: Exercise[] };
      setExercises(parsed.exercises);
      setPageState('result');
      setSaved(false);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong');
      setPageState('error');
    }
  };

  const handleSave = async () => {
    if (!currentInputs) return;
    setSaving(true);
    try {
      await client.models.Workout.create({
        inputs: JSON.stringify(currentInputs),
        exercises: JSON.stringify(exercises),
      });
      setSaved(true);
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setPageState('wizard');
    setExercises([]);
    setCurrentInputs(null);
    setSaved(false);
  };

  return (
    <Layout>
      {(pageState === 'loading-profile') && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress />
        </Box>
      )}

      {(pageState === 'wizard' || pageState === 'error') && (
        <Box>
          {pageState === 'error' && (
            <Alert severity="error" sx={{ mb: 3 }}>{errorMsg}</Alert>
          )}
          <WorkoutWizard
            onSubmit={handleGenerate}
            loading={false}
            initialProfile={savedProfile}
          />
        </Box>
      )}

      {pageState === 'generating' && (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 10, gap: 3 }}>
          <CircularProgress size={56} />
          <Typography color="text.secondary">Building your workout…</Typography>
        </Box>
      )}

      {pageState === 'result' && currentInputs && (
        <WorkoutResult
          exercises={exercises}
          inputs={currentInputs}
          onSave={handleSave}
          onReset={handleReset}
          saving={saving}
          saved={saved}
        />
      )}
    </Layout>
  );
}
