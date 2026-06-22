import { app } from './app.js'

const PORT = process.env.PORT || 8000;

if (!process.env.DATABASE_URL) {
  console.error("Error: DATABASE_URL is missing in .env file!");
  process.exit(1);
}

app.listen(PORT, () => {
console.log(`Server running at PORT: ${PORT}`);
})