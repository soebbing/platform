<?php declare(strict_types=1);

namespace Shopware\Core\Framework\DependencyInjection\CompilerPass;

use Shopware\Core\Framework\DataAbstractionLayer\EntityRepositoryInterface;
use Symfony\Component\DependencyInjection\Compiler\CompilerPassInterface;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use function mb_strstr;

/**
 * This CompilerPass filters for service ids ending on `.repository`, adding an alias to the container
 * for service arguments with the type `EntityRepositoryInterface`
 */
class RepositoryAutowireCompilerPass implements CompilerPassInterface
{
    public function process(ContainerBuilder $container)
    {
        foreach ($container->getServiceIds() as $serviceId) {
            if (mb_strstr($serviceId, '.repository') === false) {
                continue;
            }

            $container->registerAliasForArgument($serviceId, EntityRepositoryInterface::class);
        }
    }
}
