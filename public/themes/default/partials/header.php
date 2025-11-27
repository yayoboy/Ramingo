<header class="site-header">
    <div class="container">
        <div class="header-content">
            <a href="<?= $this->url() ?>" class="site-title">
                <?= $this->e($site['settings']['title']) ?>
            </a>

            <?php if (!empty($sections)): ?>
            <nav class="site-navigation">
                <ul class="nav-menu">
                    <?php foreach ($sections as $section): ?>
                        <?php if ($section['published']): ?>
                        <li class="nav-item">
                            <a href="<?= $this->url($section['slug']) ?>"
                               class="nav-link <?= (isset($currentSection) && $currentSection['id'] === $section['id']) ? 'active' : '' ?>">
                                <?= $this->e($section['name']) ?>
                            </a>
                        </li>
                        <?php endif; ?>
                    <?php endforeach; ?>
                </ul>
            </nav>
            <?php endif; ?>

            <button class="mobile-menu-toggle" aria-label="Toggle menu">
                <span></span>
                <span></span>
                <span></span>
            </button>
        </div>
    </div>
</header>
