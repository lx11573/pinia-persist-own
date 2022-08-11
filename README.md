<!--
 * @Author: lyu
 * @Date: 2022-08-10 16:57:21
-->
<h1 align="center"><samp>Pinia Persist Own</samp></h1>

<p align="center">
  <samp>一个Pinia的数据持久化插件</samp>
</p>

# 使用

## 安装

```bash
# npm
npm i pinia-persist-own
# pnpm
pnpm add pinia-persist-own
```

## 使用

```js
import { persist, createPersist } from 'pinia-persist-own'
import { createPinia } from 'pinia'

const pinia = createPinia()

// 这里传入的是公共参数，每个 store 均共享此参数
const createPersist = persist(/* 可进行传递通用参数 */)

/**
 * 如果不想进行统一设置参数的话，可以直接使用导出的 'createPersist' 
 * 每个 store 均可以进行单独进行配置，单独的配置要优先于公用配置
 * 
 */

// 添加持久化
pinia.use(createPersist)

app.use(pinia)
```

## 通用参数
- 类型： Object

  ```js
  options = { 
		// 使用何种方式进行持久化, 默认: sessionStorage
		storage: window.sessionStorage
		// 持久化时，是否启用加密，需自行加密, 默认: false
		// 当 useCrypt 为 true 时，加密解密方法必传
		useCrypt: false,
		// 加密数据方法
		encrypt: (data /* 待加密数据 */) => {
			// 加密实现
		},
		decrypt: (secretData) => {
			// 解密实现
		}
	}
  ```

## 私有参数

```ts
import { defineStore } from 'pinia' 

interface PersistProps{
	// 持久化名称
	name?: string;
	// 需要进行单独持久化的 keys => state 中的 key 集合
	keys?: string[];
	// 持久化方式，localStorage 和 sessionStorage 
	// 或者自行实现，自行实现 Storage 时，注意要实现的方法
	storage?: Storage;
	// 是否使用加密进行存储
	useCrypt?: false;
	// 加密方法
	encrypt?: (data: string) => string;
	// 解密方法
	decrypt?: (secretData: string) => string;
}

const useStore = defineStore('default-store', {
	// 是否启用持久化，传入 true/[] 均可，表示使用公用参数进行持久化
	persist: boolean | PersistProps[]
	state,
	getters,
	actions
})
```

## License

[MIT](./LICENSE) License © 2022 [Owner](https://github.com/lx11573)