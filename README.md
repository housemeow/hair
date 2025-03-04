# hair

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
npm run test:unit
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```



# hair

page structure:

- App
- - MobileLandscapeDialog
- - MainPage
- - - PrepareView
- - - - ...layout
- - - - AppLogo
- - - - LoadingProgress
- - - - PictureSelectButton
- - - - - MobilePictureSelectDialog
- - - - ErrorDialog
- - - MainView
- - - - ...layout
- - - - ProductDialog

- [x] loading RWD
- [x] loading animation (number & progress)
- [x] error RWD
- [x] select picture RWD
- [x] mobile select picture layout
- [x] select picture feature
- [x] mobile select picture selfie & select picture
- [x] main page mobile
- [x] main page

- [x] 手機、平板選擇照片邏輯 (mobile + tablet)
- [x] 單產品切版
- [x] ProductDialog 動畫會由下往上滑出
- [x] ProductDialog 產品位置
- [x] ProductDialog i 跳窗 (參考電腦版)
- [x] 把Scrollbar隱藏

## 20250302 問題
- [x] 手機版
- - [x] android 網址列滾輪問題 100vh
- - [x] 點擊重選照片 要跳彈窗
- - [x] 綁定滾輪跳兩次的感覺
- - [x] 頭髮選單選取的外圈 是切版的顏色
- - [x] 產品使用說明 按幾下的圖沒換到
- [x] PC版
- - [x] 點擊重選照片 直接選照片
- - [x] 滑鼠滾輪應該也要疼操作選單
- - [x] 產品說明滑鼠滾輪靈敏度確認

## 20250303 issue

- [ ] 參數
- - [x] 搖搖瓶網址
- - [x] blur參數 (6)
- - [x] 選單category滾動倍率參數
- - [x] 選單color滾動倍率參數
- [ ] 小瓶產品data binding 替換產品說明備註 (22)
- [ ] 預載圖片 (所有產品圖 + 頭髮)
- [x] 延長產品說明電腦版動畫延長一倍
- [x] 髮色滑到最後一個 category會變到第一個
