/**
 * Helper functions used across the application
 */
const utils = {
    /**
     * Calculate the index of @child in its parent in the DOM.
     * @param   {Element}   child   The element to calculat its index.
     * @returns {number}            The index of the child in its parent.
     */
    indexOfChild(child) {
        return Array.prototype.indexOf.call(child.parentNode.childNodes, child);
    },

    /**
     * Pluralize @word depending on the number of @count.
     * @param   {number}    count   If one the result is singular, if not, plural.
     * @param   {string}    word    The word to pluralize.
     * @returns {String}            The pluralized word.
     */
    pluralize(count, word) {
        return count === 1 ? word : word + 's';
    },

    /**
     * Creates a new object with the attributes of the objects passed as parameters.
     * @param   {Object}    An object to get the attributes from.
     * @param   {Object}    An object to get the attributes from.
     * @returns {Object}    A new object with the attributes of the object passed as parameters.
     */
    extend() {
        const newObj = {};
        let obj;
        for (let i = 0; i < arguments.length; i++) {
            obj = arguments[i];
            for (let key in obj) {
                if (obj.hasOwnProperty(key)) {
                    newObj[key] = obj[key];
                }
            }
        }
        return newObj;
    }
};

export default utils;
