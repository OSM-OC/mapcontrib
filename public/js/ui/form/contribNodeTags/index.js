
import Marionette from 'backbone.marionette';
import CONST from 'const';
import ContribNodeTagsCollection from './collection';
import ContribNodeTagsListItemView from './listItem';


export default Marionette.CollectionView.extend({
    childView: ContribNodeTagsListItemView,

    childViewOptions() {
        return {
            iDPresetsHelper: this.options.iDPresetsHelper,
            customTags: this.options.customTags,
        };
    },

    initialize(options) {
        this.collection = new ContribNodeTagsCollection();

        if (options.tags && options.tags.length > 0) {
            this.collection.add(options.tags);
        }
    },

    addTag(tag) {
        if ( tag === false ) {
            return false;
        }

        if ( typeof tag === 'undefined' ) {
            return this.collection.add({});
        }

        if (tag.key) {
            const re = /(\w+):/;
            const currentTag = this.collection.findWhere({ key: tag.key });

            if (currentTag) {
                return currentTag.set(tag);
            }

            // Search for multiCombo fields matching the tag key
            if (re.test(tag.key)) {
                const key = re.exec(tag.key)[1];
                const multiComboTag = this.collection.findWhere({
                    key,
                    type: CONST.tagType.multiCombo,
                });

                if (multiComboTag) {
                    return multiComboTag.setOption(tag.key, tag.value);
                }
            }
        }

        return this.collection.add(tag);
    },

    getTags() {
        const rawTags = this.collection.toJSON();
        const tags = [];

        for (const tag of rawTags) {
            if (tag.type === CONST.tagType.multiCombo) {
                if (tag.options) {
                    for (const key of tag.options) {
                        tags.push({
                            key,
                            value: 'yes',
                        });
                    }
                }
            }
            else {
                tags.push(tag);
            }
        }

        return tags;
    },

    hasFileToUpload() {
        let hasFileToUpload = false;

        for (const i in this.children._views) {
            if ({}.hasOwnProperty.call(this.children._views, i)) {
                const fileTag = this.children._views[i];

                if ( fileTag.isFileTag() && fileTag.valueIsNotEmpty() ) {
                    hasFileToUpload = true;
                }
            }
        }

        return hasFileToUpload;
    },

    showErrorFeedback(response) {
        for (const i in this.children._views) {
            if ({}.hasOwnProperty.call(this.children._views, i)) {
                const view = this.children._views[i];
                const modelId = response.fileInput.replace('fileInput_', '');

                if (view.model.cid === modelId) {
                    view.showErrorFeedback();
                }
            }
        }
    },

    hideErrorFeedbacks() {
        for (const i in this.children._views) {
            if ({}.hasOwnProperty.call(this.children._views, i)) {
                const view = this.children._views[i];

                view.hideErrorFeedback();
            }
        }
    },

    setFilesPathFromApiResponse(apiResponse) {
        for (const file of apiResponse) {
            const key = Object.keys(file)[0];
            const modelId = key.replace('fileInput_', '');
            const path = file[key];

            for (const i in this.children._views) {
                if ({}.hasOwnProperty.call(this.children._views, i)) {
                    const view = this.children._views[i];

                    if (view.model.cid === modelId) {
                        view.model.set('value', path);
                    }
                }
            }
        }
    },
});
