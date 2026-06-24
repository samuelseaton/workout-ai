import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Tooltip,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteIcon from '@mui/icons-material/Delete';
import Layout from '../components/Layout';
import { client } from '../lib/amplify';
import type { Exercise, SavedWorkout, WorkoutInputs } from '../types/workout';

export default function HistoryPage() {
  const [workouts, setWorkouts] = useState<SavedWorkout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchWorkouts = async () => {
    setLoading(true);
    try {
      const { data, errors } = await client.models.Workout.list();
      if (errors?.length) throw new Error(errors[0].message);

      const parsed: SavedWorkout[] = (data ?? []).map((w) => ({
        id: w.id,
        inputs: JSON.parse(w.inputs as string) as WorkoutInputs,
        exercises: JSON.parse(w.exercises as string) as Exercise[],
        createdAt: w.createdAt,
        updatedAt: w.updatedAt,
      }));

      setWorkouts(parsed.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchWorkouts(); }, []);

  const handleDelete = async (id: string) => {
    try {
      await client.models.Workout.delete({ id });
      setWorkouts((prev) => prev.filter((w) => w.id !== id));
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

  return (
    <Layout>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
        Workout History
      </Typography>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      )}

      {error && <Alert severity="error">{error}</Alert>}

      {!loading && !error && workouts.length === 0 && (
        <Typography color="text.secondary">
          No saved workouts yet. Generate and save one from the home page.
        </Typography>
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {workouts.map((workout) => (
          <Card key={workout.id} variant="outlined">
            <CardContent sx={{ pb: 0 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography sx={{ fontWeight: 700 }}>
                    {workout.inputs.workoutType} · {workout.inputs.intensity} · {workout.inputs.duration} min
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatDate(workout.createdAt)} · Goal: {workout.inputs.goal}
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                    {workout.inputs.targetMuscles.map((m) => (
                      <Chip key={m} label={m} size="small" variant="outlined" />
                    ))}
                  </Box>
                </Box>
                <Tooltip title="Delete workout">
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDelete(workout.id)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </CardContent>

            <Accordion disableGutters elevation={0} sx={{ bgcolor: 'transparent' }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="body2" color="text.secondary">
                  {workout.exercises.length} exercises — click to expand
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ pt: 0 }}>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700 }}>Exercise</TableCell>
                        <TableCell sx={{ fontWeight: 700 }} align="center">Sets</TableCell>
                        <TableCell sx={{ fontWeight: 700 }} align="center">Reps</TableCell>
                        <TableCell sx={{ fontWeight: 700 }} align="center">Tempo</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Notes</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {workout.exercises.map((ex, i) => (
                        <TableRow key={i} sx={{ '&:last-child td': { border: 0 } }}>
                          <TableCell sx={{ fontWeight: 600 }}>{ex.name}</TableCell>
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
              </AccordionDetails>
            </Accordion>
          </Card>
        ))}
      </Box>
    </Layout>
  );
}
