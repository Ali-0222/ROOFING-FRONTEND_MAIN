"use client";
import { useNotification } from '@/components/common/custom-notification';
import { callGetApi, callPostApi } from '@/utils/api';
import { Box, Button, Container, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';

export default function PromptPage() {
  const [prompt1, setPrompt1] = useState('');
  const [prompt2, setPrompt2] = useState('');
  const [updatedPrompts, setUpdatedPrompts] = useState<{ prompt1: string, prompt2: string } | null>(null); // Store updated prompts
  const { showNotification } = useNotification();

  const handleSubmit = () => {
    callPostApi("api/store-prompts", {
      prompt1: prompt1,
      prompt2: prompt2
    }, (response) => {
      showNotification(response?.message, "success");
      fetchUpdatedPrompts();
    });
  };
  const fetchUpdatedPrompts = () => {
    callGetApi("api/get-prompt", (response) => {
      setUpdatedPrompts(response?.result); 
  })
}
  useEffect(() => {
    fetchUpdatedPrompts();
  }, []);

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          mt: 4,
        }}
      >
        <Typography variant="h4" gutterBottom>
          Enter Your Prompts
        </Typography>

        <TextField
          label="Prompt 1"
          multiline
          rows={4}
          variant="outlined"
          fullWidth
          value={prompt1}
          onChange={(e) => setPrompt1(e.target.value)}
          sx={{ mb: 2 }}
        />

        <TextField
          label="Prompt 2"
          multiline
          rows={4}
          variant="outlined"
          fullWidth
          value={prompt2}
          onChange={(e) => setPrompt2(e.target.value)}
          sx={{ mb: 2 }}
        />

        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          sx={{ mt: 2 }}
        >
          Submit
        </Button>
        {updatedPrompts && (
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="h6" color='black'>
              Updated Prompts:
            </Typography>
            <Typography variant="body1" color='black'>
              <strong>Prompt 1:</strong> {updatedPrompts.prompt1}
            </Typography>
            <Typography variant="body1" color='black'>
              <strong>Prompt 2:</strong> {updatedPrompts.prompt2}
            </Typography>
          </Box>
        )}
      </Box>
    </Container>
  );
}
