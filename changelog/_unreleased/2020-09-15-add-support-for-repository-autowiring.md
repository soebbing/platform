---
title:  Add support for autowiring of entity repositories
issue:  NEXT-10918
author:             Hendrik Söbbing
author_email:       hendrik@soebbing.de
author_github:      @soebbing
---
# Core
*  Added new compilerpass `\Shopware\Core\Framework\DependencyInjection\CompilerPass\RepositoryAutowireCompilerPass`
___
### Entity Repository Autowiring

The DAL entity repositories can now be injected into your services using autowiring. Necessary for the recognition
of which repository is to be injected are the type and the name of the variable. The type needs to be
`\Shopware\Core\Framework\DataAbstractionLayer\EntityRepositoryInterface`, the variable name must be the same as the id
of the service in the DIC, written in `camelCase` instead of `snake_case`, followed by the word `Repository`.

So for example, a media_thumbnail repository (id `media_thumbnail.repository`) whould be injected like this:
```
public function __construct(EntityRepositoryInterface $mediaThumbnailRepository)
```
