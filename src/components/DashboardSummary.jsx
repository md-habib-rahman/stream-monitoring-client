import { Grid, Card, CardContent, Typography } from "@mui/material";

export default function DashboardSummary({ streams }) {
  const total = streams.length;

  const up = streams.filter((s) => s.status === "UP").length;

  const down = streams.filter((s) => s.status === "DOWN").length;

  const frozen = streams.filter((s) => s.status === "FROZEN").length;

  const low = streams.filter((s) => s.bitrateStatus === "LOW").length;

  const cards = [
    {
      title: "TOTAL",
      value: total,
    },
    {
      title: "UP",
      value: up,
    },
    {
      title: "DOWN",
      value: down,
    },
    {
      title: "FROZEN",
      value: frozen,
    },
    {
      title: "LOW BR",
      value: low,
    },
  ];

  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      {cards.map((card) => (
        <Grid item xs={6} md={2.4} key={card.title}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2">{card.title}</Typography>

              <Typography variant="h4">{card.value}</Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
