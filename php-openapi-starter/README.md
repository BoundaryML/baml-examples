> [!NOTE]  
> This example assumes you've read through the [BAML quickstart with
> OpenAPI](http://docs.boundaryml.com/docs/get-started/quickstart/openapi). Please
> go and read that first, if you haven't already.

To run this example, run these two commands in separate windows:

```bash
OPENAI_API_KEY=... npx @boundaryml/baml dev --preview
```

```bash
composer update  # you only need to run this once
php -S localhost:8000
```

Then visit http://localhost:8000 in your browser
