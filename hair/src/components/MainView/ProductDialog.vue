<script setup lang="ts">
const props = defineProps({
  doubleProduct: {
    type: Boolean,
    default: false
  }
})
const emit = defineEmits(['close'])
const handleClick = () => {
  emit('close')
}
</script>

<template>
  <dialog class="product-dialog">
    <img class="close" src="@/assets/close-button.svg" alt="" @click="handleClick">
    <main>
      <figure>
        <img class="hair" src="@/assets/hair_sample.png" alt="">
        <img src="@/assets/products/product-2-shadow.webp"
          srcset="@/assets/products/product-2-shadow@2x.webp 2x,
                  @/assets/products/product-2-shadow@3x.webp 3x"
          class="long-product-shadow">
        <img class="long-product" src="@/assets/products/long11.png" alt="">
        <template v-if="doubleProduct">
          <img src="@/assets/products/product-1-shadow.webp"
            srcset="@/assets/products/product-1-shadow@2x.webp 2x,
                    @/assets/products/product-1-shadow@3x.webp 3x"
            class="short-product-shadow">
            <img class="short-product" src="@/assets/products/short22.png" alt="">
        </template>
      </figure>
      <hgroup>
        <h1>安夏朵</h1>
        <h2>
          矯色洗髮精 12
          <template v-if="doubleProduct"><br />加強補色劑 23 羽灰</template></h2>
      </hgroup>
      <ol>
        <li>
          <h3>調配產品</h3>
          <p>根據髮長在 <em>搖搖瓶</em> 中加入約20-60ml的水，擠入適量的矯色或補色產品。</p>
          <div class="product-mix" :class="{ 'double-product': props.doubleProduct }">
            <div>
              <span>按4下</span>
              <img class="long-product" src="@/assets/products/long11.png" alt="">
            </div>
            <template v-if="doubleProduct">
              <img class="add-icon" src="@/assets/add-icon.svg" alt="">
              <div>
                <span>按4下</span>
                <img class="short-product" src="@/assets/products/short22.png" alt="">
              </div>
            </template>
          </div>
          <img src="@/assets/into-icon.webp"
            srcset="@/assets/into-icon@2x.webp 2x,
                    @/assets/into-icon@3x.webp 3x"
            class="into-icon">
          <p class="description">
            <span>20-60ml的水</span><br/>
            (加水是為了好操作，水量多寡影響不大)
          </p>
          <img src="@/assets/plus-icon.svg" alt="" class="plus-icon">
          <ul class="hair">
            <li><img src="@/assets/short-hair-icon.svg" alt=""><span>短髮1倍</span></li>
            <li><img src="@/assets/middle-hair-icon.svg" alt=""><span>中長髮2倍</span></li>
            <li><img src="@/assets/long-hair-icon.svg" alt=""><span>長髮3倍</span></li>
          </ul>
        </li>
        <li>
          <h3>塗抹產品</h3>
          <p>把頭髮洗淨後，將調配好的產品均勻地淋在頭髮上。</p>
        </li>
        <li>
          <h3>按摩起泡</h3>
          <p>輕輕搓揉頭髮，使產品起泡，等待兩分鐘。</p>
        </li>
        <li>
          <h3>沖洗</h3>
          <p>用清水徹底沖洗頭髮。</p>
        </li>
        <li>
          <h3>護理</h3>
          <p>沖洗後使用瞬間髮膜，吹乾前使用免沖洗護髮產品，然後吹乾頭髮。</p>
        </li>
      </ol>
      <aside v-if="doubleProduct">
        <span>備註</span>
        <p>圖示模擬真實洗出髮色效果<br />
  若有偏差，皆可自行調整比例<br />
  若洗出顏色太淡，請增加23號使用量<br />
  若洗出顏色太深，則減少23號使用量<br />
  若加水後過稀或過稠不好操作可調整水量</p>
      </aside>
    </main>
    <footer>
      <p>!! 隨心髮色組合優惠熱銷中 !!</p>
      <a target="_blank" href="https://www.andshadow.com/"><img src="@/assets/product-link-icon.svg" alt="">點擊進入官網商品頁</a>
    </footer>
  </dialog>
</template>

<style scoped lang="scss">
dialog {
  position: fixed;
  display: flex;
  flex-direction: column;
  top: 80px;
  left: 0;
  width: 100%;
  height: calc(100% - 80px - 50px);
  z-index: 1;

  .close {
    width: 32px;
    position: absolute;
    top: 12px;
    right: 14px;
    cursor: pointer;
    z-index: 1;
    background: black;
    border-radius: 50%;
  }

  main {
    flex: 1;
    overflow: auto;
    padding-bottom: 27px;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    flex-direction: column;
    background-image: linear-gradient(to bottom, #757575, #484848 42%, #090909);

    figure {
      display: flex;
      justify-content: center;
      position: relative;
      align-self: center;

      .hair {
        width: 180px;
        height: 180px;
        border-radius: 50%;
        margin-top: 48px;
        border: 5px solid #fff
      }

      .long-product, .short-product, .long-product-shadow, .short-product-shadow {
        max-width: none;
        position: absolute;
      }

      .long-product {
        width: 58px;
        right: -26px;
        bottom: -9px;
      }

      .long-product-shadow {
        width: 78px;
        right: -36px;
        bottom: -23px;
      }

      .short-product {
        width: 59px;
        right: 17px;
        bottom: -19px;
      }

      .short-product-shadow {
        width: 63px;
        right: 16px;
        bottom: -29px;
      }
    }

    hgroup {
      margin-top: 34px;
      display: flex;
      justify-content: center;
      align-items: center;

      h1 {
        font-size: 25px;
        font-weight: 100;
        font-stretch: normal;
        font-style: normal;
        line-height: normal;
        letter-spacing: normal;
        text-align: right;
        color: #fff;

      }

      h2 {
        display: flex;
        align-items: center;
        height: 0;
        overflow: visible;

        &::before {
          content: '';
          display: block;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background-color: #fff;
          margin-left: 10px;
          margin-right: 10px;
        }

        font-size: 16px;
        font-weight: 500;
        font-stretch: normal;
        font-style: normal;
        line-height: 1.31;
        letter-spacing: normal;
        text-align: left;
        color: #fff;
      }
    }

    ol {
      margin-top: 18px;
      display: flex;
      flex-direction: column;
      padding-left: 66px;
      padding-right: 32px;

      counter-reset: step-counter;

      > li {
        display: flex;
        flex-direction: column;
        position: relative;

        --step-size: 35px;
        --gap: 11px;

        &::before {
          content: counter(step-counter);
          counter-increment: step-counter;
          display: flex;
          justify-content: center;
          align-items: center;
          width: var(--step-size);
          height: var(--step-size);
          border: 2px solid #fff;
          background-color: #dbbe7e;
          font-size: 20px;
          font-weight: normal;
          font-stretch: normal;
          font-style: normal;
          line-height: 2.35;
          letter-spacing: normal;
          text-align: left;
          color: #000;
          position: absolute;
          border-radius: 50%;
          left: calc((var(--step-size) + var(--gap)) * -1);
          top: -1px;
        }

        &:nth-last-child(n+2)::after {
          content: '';
          display: block;
          width: 2px;
          height: 100%;
          background-color: #fff;
          position: absolute;
          left: calc((var(--step-size) / 2 + var(--gap)) * -1);
          top: var(--step-size);
        }

        h3 {
          font-size: 20px;
          font-weight: 500;
          font-stretch: normal;
          font-style: normal;
          line-height: normal;
          letter-spacing: normal;
          text-align: left;
          color: #fff;

          + * {
            margin-top: 3px;
          }
        }

        p {
          font-size: 15px;
          font-weight: normal;
          font-stretch: normal;
          font-style: normal;
          line-height: 1.4;
          letter-spacing: normal;
          text-align: left;
          color: #fff;

          em {
            font-weight: 900;
            text-decoration: underline;
          }
        }

        .product-mix {
          margin-top: 29px;
          align-self: center;
          display: flex;
          align-items: center;

          div {
            display: flex;
            flex-direction: column;
            width: 122px;
            height: 103px;
            border-radius: 7px;
            background-color: #fff;
            padding: 6px 11px;
            position: relative;

            span {
              font-size: 15px;
              font-weight: 900;
              font-stretch: normal;
              font-style: normal;
              line-height: 1.67;
              letter-spacing: normal;
              text-align: left;
              color: #6a6767;
            }

            .long-product {
              width: 36px;
              position: absolute;
              right: 14px;
              bottom: -15px;
            }
          }

          &.double-product {
            div {
              width: 103px;
            }

            .short-product {
              width: 42px;
              position: absolute;
              right: 7px;
              bottom: -14px;
            }

            .add-icon {
              margin-left: 10px;
              margin-right: 10px;
              width: 26px;
            }
          }
        }

        .into-icon {
          margin-top: 7px;
          width: 72px;
          align-self: center;
        }

        .description {
          margin-top: -5px;
          padding-top: 8px;
          padding-bottom: 13px;
          border-radius: 10px;
          border: solid 1px #fff;
          background-color: rgba(255, 255, 255, 0.4);
          text-align: center;

          font-size: 12px;
          font-weight: 500;
          font-stretch: normal;
          font-style: normal;
          line-height: 2.08;
          letter-spacing: normal;
          color: #fff;

          span {
            font-size: 15px;
            font-weight: normal;
            font-stretch: normal;
            font-style: normal;
            line-height: 1.4;
            letter-spacing: normal;
          }
        }

        .plus-icon {
          margin-top: 10px;
          align-self: center;
          width: 24px;
        }

        ul.hair {
          margin-top: 10px;
          padding: 17px 10px 11.3px 11px;
          border-radius: 10px;
          border: solid 1px #fff;
          display: flex;
          justify-content: space-between;
          height: 122px;

          li {
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-direction: column;

            img {
              width: 48px;
            }

            span {
              font-size: 14px;
              font-weight: 500;
              font-stretch: normal;
              font-style: normal;
              line-height: 1.43;
              letter-spacing: normal;
              text-align: center;
              color: #fff;

            }
          }
        }

        + li {
          margin-top: 32px;
        }
      }
    }

    aside {
      margin-top: 23px;
      margin-left: 14px;
      display: flex;
      align-items: flex-start;

      span {
        padding: 0 8px 3px;
        border-radius: 11.5px;
        background-color: #fff;
        font-size: 15px;
        font-weight: 500;
        font-stretch: normal;
        font-style: normal;
        line-height: normal;
        letter-spacing: normal;
        text-align: left;
        color: #000;
      }

      p {
        margin-left: 6px;
        font-size: 15px;
        font-weight: normal;
        font-stretch: normal;
        font-style: normal;
        line-height: 1.53;
        letter-spacing: normal;
        text-align: left;
        color: #fff;
      }
    }
  }

  footer {
    padding: 8px 19px 13px;
    background-color: #000;

    p {
      font-size: 13px;
      font-weight: 800;
      font-stretch: normal;
      font-style: normal;
      line-height: 1.92;
      letter-spacing: normal;
      text-align: center;
      color: #dbbe7e;

    }

    a {
      display: flex;
      justify-content: center;
      align-items: center;

      margin-top: 8px;
      font-size: 15px;
      font-weight: bold;
      font-stretch: normal;
      font-style: normal;
      line-height: 1.67;
      letter-spacing: normal;
      text-align: center;
      color: #000;

      height: 50px;
      width: 100%;
      border-image-slice: 50 42 0 42;
      border-image-width: 50px 42px 0px 42px;
      border-image-outset: 0px 0px 0px 0px;
      border-image-repeat: stretch round;
      border-image-source: url("@/assets/gold_btn_bg_all.png");
      border-style: solid;
      border-radius: 25px;
      box-shadow: 0 3px 6px 0 rgba(0, 0, 0, 0.16);

      img {
        max-width: none;
        width: 32px;
      }
    }
  }
}
</style>
