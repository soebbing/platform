import template from './sw-settings-custom-field-set-detail.html.twig';

const { Component, Mixin } = Shopware;
const { Criteria } = Shopware.Data;

Component.register('sw-settings-custom-field-set-detail', {
    template,

    mixins: [
        Mixin.getByName('notification'),
        Mixin.getByName('sw-inline-snippet'),
        Mixin.getByName('discard-detail-page-changes')('set')
    ],

    shortcuts: {
        'SYSTEMKEY+S': 'onSave',
        ESCAPE: 'onCancel'
    },

    inject: [
        'repositoryFactory'
    ],

    data() {
        return {
            set: {},
            setId: '',
            isLoading: false,
            isSaveSuccessful: false,
            limit: 10,
            page: 1,
            total: 0
        };
    },

    metaInfo() {
        return {
            title: this.$createTitle(this.identifier)
        };
    },

    computed: {
        identifier() {
            return this.set.config && this.set.config.label
                ? this.getInlineSnippet(this.set.config.label)
                : this.set.name;
        },

        customFieldSetRepository() {
            return this.repositoryFactory.create('custom_field_set');
        },

        customFieldRepository() {
            return this.repositoryFactory.create('custom_field');
        },

        customFieldCriteria() {
            const criteria = new Criteria();
            criteria.addFilter(Criteria.equals('customFieldSetId', this.setId));

            return criteria;
        },

        customFieldSetCriteria() {
            const criteria = new Criteria();

            criteria.addAssociation('relations');
            criteria.getAssociation('customFields')
                .setLimit(this.limit)
                .setPage(this.page)
                .addSorting(Criteria.sort('config.customFieldPosition', 'ASC'));

            return criteria;
        },

        tooltipSave() {
            const systemKey = this.$device.getSystemKey();

            return {
                message: `${systemKey} + S`,
                appearance: 'light'
            };
        },

        tooltipCancel() {
            return {
                message: 'ESC',
                appearance: 'light'
            };
        }
    },

    created() {
        this.createdComponent();
    },

    methods: {
        createdComponent() {
            if (this.$route.params.id) {
                this.setId = this.$route.params.id;
                this.loadEntityData();
            }
        },

        async loadEntityData() {
            this.set = await this.customFieldSetRepository.get(
                this.setId,
                Shopware.Context.api,
                this.customFieldSetCriteria
            );

            this.setTotalOfCustomFields();
        },

        setTotalOfCustomFields() {
            this.customFieldRepository.searchIds(this.customFieldCriteria, Shopware.Context.api).then(response => {
                this.total = response.total;
            });
        },

        saveFinish() {
            this.isSaveSuccessful = false;
        },

        onSave() {
            const setLabel = this.identifier;
            const titleSaveSuccess = this.$tc('sw-settings-custom-field.set.detail.titleSaveSuccess');
            const messageSaveSuccess = this.$tc('sw-settings-custom-field.set.detail.messageSaveSuccess', 0, {
                name: setLabel
            });
            this.isSaveSuccessful = false;
            this.isLoading = true;

            // Remove all translations except for default locale(fallbackLanguage)
            // in case, the set is not translated
            if (!this.set.config.translated || this.set.config.translated === false) {
                const fallbackLocale = this.swInlineSnippetFallbackLocale;
                this.set.config.label = { [fallbackLocale]: this.set.config.label[fallbackLocale] };
            }

            if (!this.set.relations) {
                this.set.relations = [];
            }

            this.customFieldSetRepository.save(this.set, Shopware.Context.api).then(() => {
                this.isSaveSuccessful = true;

                this.createNotificationSuccess({
                    title: titleSaveSuccess,
                    message: messageSaveSuccess
                });

                return this.loadEntityData();
            }).catch((error) => {
                const errorMessage = Shopware.Utils.get(error, 'response.data.errors[0].detail', 'Error');

                this.createNotificationError({
                    title: this.$tc('global.default.error'),
                    message: errorMessage
                });
            }).finally(() => {
                this.isLoading = false;
            });
        },

        onCancel() {
            this.$router.push({ name: 'sw.settings.custom.field.index' });
        },

        abortOnLanguageChange() {
            return this.customFieldSetRepository.hasChanges(this.set);
        },

        saveOnLanguageChange() {
            return this.onSave();
        },

        onChangeLanguage() {
            this.loadEntityData();
        },

        onPageChange(event) {
            this.page = event.page;

            this.loadEntityData();
        }
    }
});
