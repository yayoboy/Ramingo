<div class="blog-section">
    <div class="container">
        <header class="section-header">
            <h1 class="section-title"><?= $this->e($section['name']) ?></h1>
        </header>

        <?php if (!empty($entries)): ?>
        <div class="blog-entries">
            <?php foreach ($entries as $entry): ?>
                <?php if ($entry['published']): ?>
                <article class="blog-entry <?= $entry['featured'] ? 'featured' : '' ?>">
                    <?php if (!empty($entry['content']['images'][0])): ?>
                    <div class="blog-image-wrapper">
                        <img src="<?= $this->e($entry['content']['images'][0]) ?>"
                             alt="<?= $this->e($entry['title']) ?>"
                             class="blog-image"
                             loading="lazy">
                    </div>
                    <?php endif; ?>

                    <div class="blog-content">
                        <header class="blog-header">
                            <h2 class="blog-title">
                                <a href="<?= $this->url($section['slug'] . '/' . $entry['slug']) ?>">
                                    <?= $this->e($entry['title']) ?>
                                </a>
                            </h2>

                            <div class="blog-meta">
                                <time datetime="<?= $entry['createdAt'] ?>">
                                    <?= date('F j, Y', strtotime($entry['createdAt'])) ?>
                                </time>

                                <?php if (!empty($entry['content']['metadata']['tags'])): ?>
                                <div class="blog-tags">
                                    <?php foreach ($entry['content']['metadata']['tags'] as $tag): ?>
                                        <span class="tag"><?= $this->e($tag) ?></span>
                                    <?php endforeach; ?>
                                </div>
                                <?php endif; ?>
                            </div>
                        </header>

                        <div class="blog-excerpt">
                            <?php
                            // Extract plain text excerpt from HTML
                            $text = strip_tags($entry['content']['description']);
                            $excerpt = mb_substr($text, 0, 200);
                            echo $this->e($excerpt) . (mb_strlen($text) > 200 ? '...' : '');
                            ?>
                        </div>

                        <a href="<?= $this->url($section['slug'] . '/' . $entry['slug']) ?>"
                           class="read-more">
                            Read more &rarr;
                        </a>
                    </div>
                </article>
                <?php endif; ?>
            <?php endforeach; ?>
        </div>
        <?php else: ?>
        <div class="empty-state">
            <p>No blog posts yet.</p>
        </div>
        <?php endif; ?>
    </div>
</div>
