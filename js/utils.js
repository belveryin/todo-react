const utils = {
    indexOfChild(child) {
        return Array.prototype.indexOf.call(child.parentNode.childNodes, child);
    },

    pluralize(count, word) {
        return count === 1 ? word : word + 's';
    },

    store(namespace, data) {
        if (data) {
            return localStorage.setItem(namespace, JSON.stringify(data));
        }

        const store = localStorage.getItem(namespace);
        return (store && JSON.parse(store)) || [];
    },

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
