<script setup lang="ts">
import { useMainStore } from '@/stores';
import DyedHair from '@/components/DyedHair.vue';
import ProductImage from '@/components/ProductImage.vue';

const store = useMainStore()

const handleClick = () => {
  store.productDialog = false
}
</script>

<template>
  <div class="product-dialog" @click.self="handleClick">
    <dialog>
      <main class="no-scrollbar">
        <div class="part1">
          <figure>
            <DyedHair :color="store.selectedColor" />
            <img src="@/assets/products/product-2-shadow.webp"
              srcset="@/assets/products/product-2-shadow@2x.webp 2x,
                      @/assets/products/product-2-shadow@3x.webp 3x"
              class="long-product-shadow">
            <ProductImage class="long-product" :product="store.selectedColor.product1" />
            <template v-if="store.selectedColor.product2">
              <img src="@/assets/products/product-1-shadow.webp"
                srcset="@/assets/products/product-1-shadow@2x.webp 2x,
                        @/assets/products/product-1-shadow@3x.webp 3x"
                class="short-product-shadow">
              <ProductImage class="short-product" :product="store.selectedColor.product2" />
            </template>
          </figure>
          <hgroup>
            <h1>安夏朵</h1>
            <h2>
              {{ store.selectedColor.product1.name }}
              <template v-if="store.selectedColor.product2"><br />{{ store.selectedColor.product2.name }}</template></h2>
          </hgroup>
        </div>
        <div class="part2 no-scrollbar">
          <ol>
            <li>
              <h3>調配產品</h3>
              <p>根據髮長在 <a :href="store.config.mixingBottleLink" target="_blank">搖搖瓶</a> 中加入約20-60ml的水，擠入適量的矯色或補色產品。</p>
              <div class="product-mix" :class="{ 'double-product': store.selectedColor.product2 }">
                <div>
                  <span>按{{ store.selectedColor.product1.usage }}下</span>
                  <ProductImage class="long-product" :product="store.selectedColor.product1" />
                </div>
                <template v-if="store.selectedColor.product2">
                  <img class="add-icon" src="@/assets/add-icon.svg" alt="">
                  <div>
                    <span>按{{ store.selectedColor.product2.usage }}下</span>
                    <ProductImage class="short-product" :product="store.selectedColor.product2" />
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
          <aside v-if="store.selectedColor.product2">
            <span>備註</span>
            <p>圖示模擬真實洗出髮色效果<br />
      若有偏差，皆可自行調整比例<br />
      若洗出顏色太淡，請增加23號使用量<br />
      若洗出顏色太深，則減少23號使用量<br />
      若加水後過稀或過稠不好操作可調整水量</p>
          </aside>
        </div>
      </main>
      <footer>
        <p>!! 隨心髮色組合優惠熱銷中 !!</p>
        <a target="_blank" :href="store.selectedColor.link"><img src="@/assets/product-link-icon.svg" alt="">點擊進入官網商品頁</a>
      </footer>
      <img class="close" src="@/assets/close-button.svg" alt="" @click="handleClick">
    </dialog>
  </div>
</template>

<style scoped lang="scss">
.product-dialog {
  position: fixed;
  top: 80px;
  left: 0;
  width: 100%;
  display: flex;
  height: calc(100% - 80px - 50px);

  dialog {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    background-image: linear-gradient(to bottom, #757575, #484848 42%, #090909);

    main {
      flex: 1;
      overflow: auto;
      padding-bottom: 27px;
      display: flex;
      flex-direction: column;

      .part1 {
        display: flex;
        flex-direction: column;

        figure {
          display: flex;
          justify-content: center;
          position: relative;
          align-self: center;

          .dyed-hair {
            width: 180px;
            height: 180px;
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
      }

      .part2 {
        display: flex;
        flex-direction: column;

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
              width: 1px;
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

              a {
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
            flex-shrink: 0;
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
  }
}

@media screen and (min-width: 601px) {
  .product-dialog {
    top: 0;
    height: 100%;
    background-image: linear-gradient(to bottom, rgba(255, 255, 255, 0), #fff 34%, #fff 65%, rgba(255, 255, 255, 0));
    justify-content: center;
    align-items: flex-start;
    padding-top: 145px;

    dialog {
      width: 650px;
      border-radius: 22px;
      position: relative;
      height: auto;

      main {
        flex: auto;
        height: 424px;
        flex-direction: row;
        overflow: hidden;

        .part1 {
          flex-shrink: 0;
          padding-top: 100px;
          padding-left: 56px;

          figure {
            margin-right: 25px;
            flex-direction: column;
            align-items: flex-start;

            .dyed-hair {
              margin-top: 0;
            }
          }

          hgroup {
            flex-direction: column;
            align-self: flex-end;
            margin-top: 31px;
            align-items: flex-end;

            h2 {
              height: auto;
              text-align: right;

              &::before {
                content: none;
              }
            }
          }
        }

        .part2 {
          overflow: auto;
          padding-top: 53px;
          padding-right: 42px;
          padding-bottom: 53px;

          ol {
            padding-left: 75px;
            padding-right: 0;

            > li {
              h3 {
                + * {
                  margin-top: 1px;
                }
              }
            }
          }

          aside {
            margin-left: 24px;
          }
        }
      }

      footer {
        border-bottom-left-radius: 22px;
        border-bottom-right-radius: 22px;
      }

      .close {
        top: 17px;
        right: 20px;
      }
    }
  }
}
</style>
