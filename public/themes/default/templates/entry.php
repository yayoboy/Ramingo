<div class="entry-detail">
    <div class="container">
        <article class="entry" style="<?= !empty($entry['content']['metadata']['customFont']) ? 'font-family: \'' . $this->e($entry['content']['metadata']['customFont']) . '\', sans-serif;' : '' ?>">
            <header class="entry-header">
                <nav class="breadcrumb">
                    <a href="<?= $this->url() ?>">Home</a>
                    <span class="separator">/</span>
                    <a href="<?= $this->url($section['slug']) ?>"><?= $this->e($section['name']) ?></a>
                    <span class="separator">/</span>
                    <span class="current"><?= $this->e($entry['title']) ?></span>
                </nav>

                <h1 class="entry-title"><?= $this->e($entry['title']) ?></h1>

                <div class="entry-meta">
                    <time datetime="<?= $entry['createdAt'] ?>">
                        <?= date('F j, Y', strtotime($entry['createdAt'])) ?>
                    </time>

                    <?php if (!empty($entry['content']['metadata']['year'])): ?>
                    <span class="meta-item">Year: <?= $this->e($entry['content']['metadata']['year']) ?></span>
                    <?php endif; ?>
                </div>

                <?php if (!empty($entry['content']['metadata']['tags'])): ?>
                <div class="entry-tags">
                    <?php foreach ($entry['content']['metadata']['tags'] as $tag): ?>
                        <span class="tag"><?= $this->e($tag) ?></span>
                    <?php endforeach; ?>
                </div>
                <?php endif; ?>
            </header>

            <div class="entry-content prose">
                <?= $entry['content']['description'] ?>
            </div>

            <?php if (!empty($entry['content']['images'])): ?>
            <div class="entry-gallery">
                <?php foreach ($entry['content']['images'] as $index => $image): ?>
                    <figure class="entry-image-figure">
                        <img src="<?= $this->e($image) ?>"
                             alt="<?= $this->e($entry['title']) ?> - Image <?= $index + 1 ?>"
                             class="entry-image">
                    </figure>
                <?php endforeach; ?>
            </div>
            <?php endif; ?>

            <footer class="entry-footer">
                <a href="<?= $this->url($section['slug']) ?>" class="back-link">
                    &larr; Back to <?= $this->e($section['name']) ?>
                </a>
            </footer>
        </article>
    </div>
</div>
