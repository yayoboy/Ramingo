<div class="gallery-section">
    <div class="container">
        <header class="section-header">
            <h1 class="section-title"><?= $this->e($section['name']) ?></h1>
            <?php if (!empty($section['settings']['description'])): ?>
            <p class="section-description"><?= $this->e($section['settings']['description']) ?></p>
            <?php endif; ?>
        </header>

        <?php if (!empty($entries)): ?>
        <div class="gallery-grid" data-columns="<?= $section['settings']['columns'] ?? 3 ?>">
            <?php foreach ($entries as $entry): ?>
                <?php if ($entry['published']): ?>
                <article class="gallery-item <?= $entry['featured'] ? 'featured' : '' ?>">
                    <a href="<?= $this->url($section['slug'] . '/' . $entry['slug']) ?>" class="gallery-link">
                        <?php if (!empty($entry['content']['images'][0])): ?>
                        <div class="gallery-image-wrapper">
                            <img src="<?= $this->e($entry['content']['images'][0]) ?>"
                                 alt="<?= $this->e($entry['title']) ?>"
                                 class="gallery-image"
                                 loading="lazy">
                        </div>
                        <?php endif; ?>

                        <?php if ($section['settings']['showTitles'] ?? true): ?>
                        <div class="gallery-caption">
                            <h3 class="gallery-title"><?= $this->e($entry['title']) ?></h3>

                            <?php if (!empty($entry['content']['metadata']['tags'])): ?>
                            <div class="gallery-tags">
                                <?php foreach (array_slice($entry['content']['metadata']['tags'], 0, 2) as $tag): ?>
                                    <span class="tag"><?= $this->e($tag) ?></span>
                                <?php endforeach; ?>
                            </div>
                            <?php endif; ?>
                        </div>
                        <?php endif; ?>
                    </a>
                </article>
                <?php endif; ?>
            <?php endforeach; ?>
        </div>
        <?php else: ?>
        <div class="empty-state">
            <p>No gallery items yet.</p>
        </div>
        <?php endif; ?>
    </div>
</div>

<?php if ($section['settings']['enableLightbox'] ?? false): ?>
<script>
    // Simple lightbox initialization
    document.querySelectorAll('.gallery-link').forEach(link => {
        link.addEventListener('click', function(e) {
            if (window.innerWidth > 768) {
                e.preventDefault();
                // Lightbox logic would go here
            }
        });
    });
</script>
<?php endif; ?>
