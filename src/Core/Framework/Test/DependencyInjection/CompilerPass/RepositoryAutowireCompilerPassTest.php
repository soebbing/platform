<?php declare(strict_types=1);

namespace Shopware\Core\Framework\Test\DependencyInjection\CompilerPass;

use PHPUnit\Framework\TestCase;
use Shopware\Core\Checkout\Order\OrderDefinition;
use Shopware\Core\Framework\DataAbstractionLayer\EntityRepository;
use Shopware\Core\Framework\DependencyInjection\CompilerPass\RepositoryAutowireCompilerPass;
use Symfony\Component\DependencyInjection\ContainerBuilder;

class RepositoryAutowireCompilerPassTest extends TestCase
{
    public function testProcess()
    {
        $container = new ContainerBuilder();

        $container->register('one_test.repository', OneTestEntityRepository::class);
        $container->register('two_test.repository', TwoTestEntityRepository::class);
        $container->register(OrderDefinition::class, OrderDefinition::class);

        $repositoryAutowire = new RepositoryAutowireCompilerPass();
        $repositoryAutowire->process($container);

        // Make sure the correct aliases have been set
        self::assertNotNull($container->getAlias('Shopware\Core\Framework\DataAbstractionLayer\EntityRepositoryInterface $oneTestRepository'));
        self::assertNotNull($container->getAlias('Shopware\Core\Framework\DataAbstractionLayer\EntityRepositoryInterface $twoTestRepository'));

        // Also make sure no unwanted aliases are created
        self::assertCount(8, $container->getServiceIds());
        self::assertCount(4, $container->getAliases());
    }
}

class OneTestEntityRepository extends EntityRepository
{
    public function __construct()
    {
    }
}

class TwoTestEntityRepository extends EntityRepository
{
    public function __construct()
    {
    }
}
