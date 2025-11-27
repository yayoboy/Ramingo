<div class="page-section">
    <div class="container">
        <?php if (!empty($entries)): ?>
            <?php foreach ($entries as $entry): ?>
                <?php if ($entry['published']): ?>
                <article class="page-entry" style="<?= !empty($entry['content']['metadata']['customFont']) ? 'font-family: \'' . $this->e($entry['content']['metadata']['customFont']) . '\', sans-serif;' : '' ?>">
                    <header class="entry-header">
                        <h1 class="entry-title"><?= $this->e($entry['title']) ?></h1>

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
                    <div class="entry-images">
                        <?php foreach ($entry['content']['images'] as $image): ?>
                            <img src="<?= $this->e($image) ?>"
                                 alt="<?= $this->e($entry['title']) ?>"
                                 class="entry-image">
                        <?php endforeach; ?>
                    </div>
                    <?php endif; ?>
                </article>
                <?php endif; ?>
            <?php endforeach; ?>
        <?php else: ?>
            <div class="empty-state">
                <p>No content available.</p>
            </div>
        <?php endif; ?>
    </div>
</div>
