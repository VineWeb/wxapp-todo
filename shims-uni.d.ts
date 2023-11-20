/// <reference types='@dcloudio/types' />
import 'vue'
declare module 'crypto-js' {
  const CryptoJS: {
    AES: {
      encrypt(data: string, key: any, config?: any): any;
      decrypt(data: string, key: any, config?: any): any;
    };
    // Add other modules as needed
  };
  export = CryptoJS;
}

declare module "vue" {
  type Hooks = App.AppInstance & Page.PageInstance;
  interface ComponentCustomOptions extends Hooks {}
}
declare module '@vue/runtime-core' {
  type Hooks = App.AppInstance & Page.PageInstance;

  interface ComponentCustomOptions extends Hooks {

  }
}