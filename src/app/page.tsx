import { Box, Container } from "@mui/material";
import { GameDashboard } from "@/components/home/GameDashboard";

export default function HomePage() {
  return (
    <main>
      <Box
        component="section"
        sx={{
          minHeight: "100vh",
          background:
            "radial-gradient(circle at top, rgba(255,110,199,0.15), transparent 60%), linear-gradient(180deg, #070017 0%, #03010b 80%)",
        }}
      >
        <Container maxWidth="lg">
          <GameDashboard />
        </Container>
      </Box>
    </main>
  );
}