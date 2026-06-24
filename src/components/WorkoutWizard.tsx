import { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  FormLabel,
  Checkbox,
  FormGroup,
  Select,
  MenuItem,
  InputLabel,
  Stepper,
  Step,
  StepLabel,
  Divider,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { type Dayjs } from 'dayjs';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import type { WorkoutInputs } from '../types/workout';

const ALL_STEPS = ['About You', 'Body Stats', 'Workout Type', 'Intensity', 'Goal', 'Muscles', 'Duration'];
const YOGA_SKIP = new Set([4, 5]); // skip Goal and Muscles for Yoga
const WORKOUT_TYPES = ['Bodybuilding', 'Powerlifting', 'Powerbuilding', 'Calisthenics', 'Yoga'];
const INTENSITIES = ['Beginner', 'Intermediate', 'Advanced'];
const GOALS = ['Bulking', 'Cutting', 'Maintaining'];
const DURATIONS = [30, 45, 60, 90];

const MUSCLE_GROUPS: Record<string, string[]> = {
  Upper: ['Chest', 'Back', 'Shoulders', 'Traps'],
  Arms: ['Biceps', 'Triceps', 'Forearms'],
  Core: ['Abs', 'Obliques', 'Lower Back'],
  Legs: ['Quads', 'Hamstrings', 'Glutes', 'Calves'],
};

const HEIGHT_OPTIONS = Array.from({ length: 37 }, (_, i) => {
  const total = 48 + i;
  return `${Math.floor(total / 12)}'${total % 12}"`;
});

const WEIGHT_OPTIONS = Array.from({ length: 141 }, (_, i) => `${80 + i * 2} lbs`);

const DEFAULT_INPUTS: WorkoutInputs = {
  birthday: '',
  gender: '',
  height: '',
  weight: '',
  workoutType: '',
  intensity: '',
  goal: '',
  targetMuscles: [],
  duration: 60,
};

interface Props {
  onSubmit: (inputs: WorkoutInputs) => void;
  loading: boolean;
  initialProfile?: Partial<WorkoutInputs>;
}

export default function WorkoutWizard({ onSubmit, loading, initialProfile }: Props) {
  const [step, setStep] = useState(0);
  const [inputs, setInputs] = useState<WorkoutInputs>({ ...DEFAULT_INPUTS, ...initialProfile });

  const isYoga = inputs.workoutType === 'Yoga';
  const visibleIndices = ALL_STEPS.map((_, i) => i).filter((i) => !isYoga || !YOGA_SKIP.has(i));
  const visibleSteps = visibleIndices.map((i) => ALL_STEPS[i]);
  const actualStep = visibleIndices[step];

  const update = <K extends keyof WorkoutInputs>(field: K, value: WorkoutInputs[K]) =>
    setInputs((prev) => ({ ...prev, [field]: value }));

  const toggleMuscle = (muscle: string) =>
    setInputs((prev) => ({
      ...prev,
      targetMuscles: prev.targetMuscles.includes(muscle)
        ? prev.targetMuscles.filter((m) => m !== muscle)
        : [...prev.targetMuscles, muscle],
    }));

  const toggleGroup = (muscles: string[]) => {
    const allSelected = muscles.every((m) => inputs.targetMuscles.includes(m));
    setInputs((prev) => ({
      ...prev,
      targetMuscles: allSelected
        ? prev.targetMuscles.filter((m) => !muscles.includes(m))
        : [...new Set([...prev.targetMuscles, ...muscles])],
    }));
  };

  const handleWorkoutTypeChange = (value: string) => {
    setInputs((prev) => ({
      ...prev,
      workoutType: value,
      ...(value === 'Yoga' && { goal: '', targetMuscles: [] }),
    }));
  };

  const canAdvance = (): boolean => {
    switch (actualStep) {
      case 0: return inputs.birthday !== '' && inputs.gender !== '';
      case 1: return inputs.height !== '' && inputs.weight !== '';
      case 2: return inputs.workoutType !== '';
      case 3: return inputs.intensity !== '';
      case 4: return inputs.goal !== '';
      case 5: return inputs.targetMuscles.length > 0;
      case 6: return true;
      default: return false;
    }
  };

  const renderStep = () => {
    switch (actualStep) {
      case 0:
        return (
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <DatePicker
                label="Birthday"
                value={inputs.birthday ? dayjs(inputs.birthday) : null}
                onChange={(val: Dayjs | null) => update('birthday', val ? val.format('YYYY-MM-DD') : '')}
                disableFuture
                slotProps={{ textField: { fullWidth: true } }}
              />
              <FormControl>
                <FormLabel>Gender</FormLabel>
                <RadioGroup row value={inputs.gender} onChange={(e) => update('gender', e.target.value)}>
                  {['Male', 'Female'].map((g) => (
                    <FormControlLabel key={g} value={g} control={<Radio />} label={g} />
                  ))}
                </RadioGroup>
              </FormControl>
            </Box>
          </LocalizationProvider>
        );

      case 1:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <FormControl fullWidth>
              <InputLabel>Height</InputLabel>
              <Select value={inputs.height} label="Height" onChange={(e) => update('height', e.target.value)}>
                {HEIGHT_OPTIONS.map((h) => <MenuItem key={h} value={h}>{h}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Weight</InputLabel>
              <Select value={inputs.weight} label="Weight" onChange={(e) => update('weight', e.target.value)}>
                {WEIGHT_OPTIONS.map((w) => <MenuItem key={w} value={w}>{w}</MenuItem>)}
              </Select>
            </FormControl>
          </Box>
        );

      case 2:
        return (
          <FormControl>
            <FormLabel>Workout Style</FormLabel>
            <RadioGroup value={inputs.workoutType} onChange={(e) => handleWorkoutTypeChange(e.target.value)}>
              {WORKOUT_TYPES.map((t) => (
                <FormControlLabel key={t} value={t} control={<Radio />} label={t} />
              ))}
            </RadioGroup>
          </FormControl>
        );

      case 3:
        return (
          <FormControl>
            <FormLabel>Experience Level</FormLabel>
            <RadioGroup value={inputs.intensity} onChange={(e) => update('intensity', e.target.value)}>
              {INTENSITIES.map((i) => (
                <FormControlLabel key={i} value={i} control={<Radio />} label={i} />
              ))}
            </RadioGroup>
          </FormControl>
        );

      case 4:
        return (
          <FormControl>
            <FormLabel>Primary Goal</FormLabel>
            <RadioGroup value={inputs.goal} onChange={(e) => update('goal', e.target.value)}>
              {GOALS.map((g) => (
                <FormControlLabel key={g} value={g} control={<Radio />} label={g} />
              ))}
            </RadioGroup>
          </FormControl>
        );

      case 5:
        return (
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Select all muscles you want to target
            </Typography>
            {Object.entries(MUSCLE_GROUPS).map(([group, muscles]) => {
              const allChecked = muscles.every((m) => inputs.targetMuscles.includes(m));
              const someChecked = muscles.some((m) => inputs.targetMuscles.includes(m));
              return (
                <Box key={group} sx={{ mb: 2 }}>
                  <FormControlLabel
                    label={<Typography sx={{ fontWeight: 600 }}>{group}</Typography>}
                    control={
                      <Checkbox
                        checked={allChecked}
                        indeterminate={someChecked && !allChecked}
                        onChange={() => toggleGroup(muscles)}
                      />
                    }
                  />
                  <Divider sx={{ mb: 1 }} />
                  <FormGroup row sx={{ pl: 3 }}>
                    {muscles.map((m) => (
                      <FormControlLabel
                        key={m}
                        label={m}
                        control={
                          <Checkbox
                            checked={inputs.targetMuscles.includes(m)}
                            onChange={() => toggleMuscle(m)}
                          />
                        }
                      />
                    ))}
                  </FormGroup>
                </Box>
              );
            })}
          </Box>
        );

      case 6:
        return (
          <FormControl>
            <FormLabel>Session Duration</FormLabel>
            <RadioGroup
              row
              value={String(inputs.duration)}
              onChange={(e) => update('duration', Number(e.target.value))}
            >
              {DURATIONS.map((d) => (
                <FormControlLabel key={d} value={String(d)} control={<Radio />} label={`${d} min`} />
              ))}
            </RadioGroup>
          </FormControl>
        );

      default:
        return null;
    }
  };

  return (
    <Box>
      <Stepper activeStep={step} alternativeLabel sx={{ mb: 4 }}>
        {visibleSteps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
        {visibleSteps[step]}
      </Typography>

      {renderStep()}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => setStep((s) => s - 1)}
          disabled={step === 0 || loading}
          variant="outlined"
        >
          Back
        </Button>

        {step < visibleSteps.length - 1 ? (
          <Button
            endIcon={<ArrowForwardIcon />}
            onClick={() => setStep((s) => s + 1)}
            disabled={!canAdvance()}
            variant="contained"
          >
            Next
          </Button>
        ) : (
          <Button
            startIcon={<AutoFixHighIcon />}
            onClick={() => onSubmit(inputs)}
            disabled={loading}
            variant="contained"
            size="large"
          >
            {loading ? 'Generating…' : 'Generate Workout'}
          </Button>
        )}
      </Box>
    </Box>
  );
}
