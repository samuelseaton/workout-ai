import {
  Box,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Alert,
  Divider,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import ReplayIcon from '@mui/icons-material/Replay';
import type { Exercise, WorkoutInputs } from '../types/workout';

interface Props {
  exercises: Exercise[];
  inputs: WorkoutInputs;
  onSave: () => void;
  onReset: () => void;
  saving: boolean;
  saved: boolean;
}

export default function WorkoutResult({ exercises, inputs, onSave, onReset, saving, saved }: Props) {
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Your Workout
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {inputs.workoutType} · {inputs.intensity} · {inputs.duration} min · {inputs.goal}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button startIcon={<ReplayIcon />} onClick={onReset} variant="outlined">
            New Workout
          </Button>
          {!saved && (
            <Button
              startIcon={<SaveIcon />}
              onClick={onSave}
              variant="contained"
              disabled={saving}
            >
              {saving ? 'Saving…' : 'Save'}
            </Button>
          )}
        </Box>
      </Box>

      {saved && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Workout saved to history.
        </Alert>
      )}

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
        {inputs.targetMuscles.map((m) => (
          <Chip key={m} label={m} size="small" variant="outlined" />
        ))}
      </Box>

      <Divider sx={{ mb: 3 }} />

      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>#</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Exercise</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="center">Sets</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="center">Reps</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="center">Tempo</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Notes</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {exercises.map((ex, i) => (
              <TableRow key={i} sx={{ '&:last-child td': { border: 0 } }}>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {i + 1}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography sx={{ fontWeight: 600 }}>{ex.name}</Typography>
                </TableCell>
                <TableCell align="center">{ex.sets}</TableCell>
                <TableCell align="center">{ex.reps}</TableCell>
                <TableCell align="center">
                  <Chip label={ex.tempo} size="small" />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {ex.note}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
