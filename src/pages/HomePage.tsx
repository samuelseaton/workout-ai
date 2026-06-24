import { useState, useEffect, useRef } from 'react';
import { Alert, Box, CircularProgress, Dialog, Typography } from '@mui/material';
import { Authenticator, useAuthenticator } from '@aws-amplify/ui-react';
import WorkoutWizard from '../components/WorkoutWizard';
import WorkoutResult from '../components/WorkoutResult';
import Layout from '../components/Layout';
import { client } from '../lib/amplify';
import type { Exercise, WorkoutInputs } from '../types/workout';

type PageState = 'loading-profile' | 'wizard' | 'generating' | 'result' | 'error';

export default function HomePage() {
  const { authStatus } = useAuthenticator();
  const [pageState, setPageState] = useState<PageState>('wizard');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [currentInputs, setCurrentInputs] = useState<WorkoutInputs | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [profileId, setProfileId] = useState<string | null>(null);
  const [savedProfile, setSavedProfile] = useState<Partial<WorkoutInputs>>({});
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const pendingInputs = useRef<WorkoutInputs | null>(null);

  useEffect(() => {
    if (authStatus !== 'authenticated') return;

    const loadProfile = async () => {
      setPageState('loading-profile');
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
  }, [authStatus]);

  // After login via modal, auto-trigger the pending generation
  useEffect(() => {
    if (authStatus !== 'authenticated' || !pendingInputs.current) return;
    const inputs = pendingInputs.current;
    pendingInputs.current = null;
    setLoginModalOpen(false);
    runGenerate(inputs);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authStatus]);

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

  const runGenerate = async (inputs: WorkoutInputs) => {
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

  const handleGenerate = (inputs: WorkoutInputs) => {
    if (authStatus !== 'authenticated') {
      pendingInputs.current = inputs;
      setLoginModalOpen(true);
      return;
    }
    runGenerate(inputs);
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
      {pageState === 'loading-profile' && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress />
        </Box>
      )}

      {(pageState === 'wizard' || pageState === 'generating' || pageState === 'error') && (
        <Box>
          {pageState === 'error' && (
            <Alert severity="error" sx={{ mb: 3 }}>{errorMsg}</Alert>
          )}
          {pageState === 'generating' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4, gap: 3 }}>
              <CircularProgress size={56} />
              <Typography color="text.secondary">Building your workout…</Typography>
            </Box>
          )}
          <Box sx={{ display: pageState === 'generating' ? 'none' : 'block' }}>
            <WorkoutWizard
              onSubmit={handleGenerate}
              loading={pageState === 'generating'}
              initialProfile={savedProfile}
            />
          </Box>
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

      <Dialog open={loginModalOpen} onClose={() => setLoginModalOpen(false)} maxWidth="sm" fullWidth>
        <Typography variant="h6" sx={{ pt: 3, px: 3, fontWeight: 700, textAlign: 'center' }}>
          Sign in to generate your workout
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
          <Authenticator hideSignUp />
        </Box>
      </Dialog>
    </Layout>
  );
}
