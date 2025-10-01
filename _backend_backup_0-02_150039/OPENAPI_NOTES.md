# OpenAPI / Swagger Setup (Laravel)

1. Install package:

```bash
composer require darkaonline/l5-swagger
```

1. Publish config & assets:

```bash
php artisan vendor:publish --provider "L5Swagger\\L5SwaggerServiceProvider"
```

1. Generate docs:

```bash
php artisan l5-swagger:generate
```

1. Access UI (default): `http://localhost:8000/api/documentation`

## Security (optional)

Add to config `l5-swagger.php` if auth needed.

## Annotations Location

Controller annotations added in `app/Http/Controllers/EventController.php`.

## Components Schemas

Defined at bottom of `EventController.php` for brevity. In production, move to dedicated annotation file, e.g. `app/OpenApi/Schemas.php`.
