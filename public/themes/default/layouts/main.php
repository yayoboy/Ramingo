<!DOCTYPE html>
<html lang="<?= $site['settings']['language'] ?? 'en' ?>">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= isset($pageTitle) ? $this->e($pageTitle) . ' - ' : '' ?><?= $this->e($site['settings']['title']) ?></title>

    <?php if (isset($seo)): ?>
    <meta name="description" content="<?= $this->e($seo['description'] ?? $site['settings']['description']) ?>">
    <?php if (!empty($seo['ogImage'])): ?>
    <meta property="og:image" content="<?= $this->e($seo['ogImage']) ?>">
    <?php endif; ?>
    <?php endif; ?>

    <!-- Google Fonts -->
    <?php if (isset($site['settings']['fonts'])): ?>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=<?= urlencode($site['settings']['fonts']['heading']) ?>:wght@400;700&family=<?= urlencode($site['settings']['fonts']['body']) ?>:wght@400;500;700&display=swap" rel="stylesheet">
    <?php endif; ?>

    <!-- Theme CSS -->
    <link rel="stylesheet" href="<?= $this->asset('css/style.css') ?>">

    <!-- Custom Styles -->
    <style>
        :root {
            --color-primary: <?= $site['settings']['colors']['primary'] ?? '#1a1a1a' ?>;
            --color-secondary: <?= $site['settings']['colors']['secondary'] ?? '#ffffff' ?>;
            --color-accent: <?= $site['settings']['colors']['accent'] ?? '#3b82f6' ?>;
            --font-heading: <?= isset($site['settings']['fonts']['heading']) ? "'" . $site['settings']['fonts']['heading'] . "'" : 'Georgia' ?>, serif;
            --font-body: <?= isset($site['settings']['fonts']['body']) ? "'" . $site['settings']['fonts']['body'] . "'" : 'system-ui' ?>, sans-serif;
        }
    </style>
</head>
<body>
    <?php $this->partial('header', ['site' => $site, 'sections' => $sections ?? []]); ?>

    <main class="main-content">
        <?= $content ?>
    </main>

    <?php $this->partial('footer', ['site' => $site]); ?>

    <script src="<?= $this->asset('js/main.js') ?>"></script>
</body>
</html>
