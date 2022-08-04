class StorageConfig {
    constructor() {
    }
    static storeage = null;

    static getStorage() {
        if (this.storeage == null) {
           this.storeage = new Redis
        }
        return this.storeage;
    }
}