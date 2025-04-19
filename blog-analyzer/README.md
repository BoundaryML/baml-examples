# Blog-analyzer

This example incrementally scrapes a website and analyzes the content of the blog posts.

Run the following command to start the scraper server:

```bash
uv sync
uv run baml-cli generate
uv run fastapi run app.py
```

Then start the frontend:

```bash
cd frontend
pnpm i
pnpm run dev
```

Then open `http://localhost:3000` in your browser and enter a website!


![Image Preview](./demo.png)
