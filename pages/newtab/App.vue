<template>
  <el-config-provider :size="size" :z-index="zIndex">
    <main ref="main" class="main">
      <el-header>
        <el-row>
          <el-col :span="2">
            <TabList></TabList>
          </el-col>
          <el-col :span="2">
            <BookMarks></BookMarks>
          </el-col>
        </el-row>
      </el-header>
      <div>
        <input ref="search" class="search" v-model="kw" @keyup.enter="onSearch" />
      </div>
      <!-- <video muted loop id="myVideo"></video> -->
      <el-dialog v-model="showDialog" width="80%" destroy-on-close center>
        <vue-json-pretty v-bind="dialogProps" />
      </el-dialog>
    </main>
  </el-config-provider>

</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import TabList from './TabList.vue'
import BookMarks from './BookMarks.vue'
import { getImageBase64 } from "./util"
// import { ArrowDown } from '@element-plus/icons-vue'
import VueJsonPretty from 'vue-json-pretty';
import 'vue-json-pretty/lib/styles.css';

const size = 'small'
const zIndex = 3000
const kw = ref('')
const search = ref()
const onSearch = () => {
  window.open(`https://www.google.com/search?q=${kw.value}`)
}

// function fetchVideo() {
//   fetch("https://randomvideo.vercel.app/randomvideo")
//     .then((resp) => resp.json())
//     .then((res) => {
//       // insertVideo(res?.src?.video_files[0].link);
//       insertVideo(res?.src?.video_files[0].link);
//     })
//     .catch(() => {
//       error();
//     });
// }

// function pexelsVideo() {
//   fetch("https://api.pexels.com/videos/popular?per_page=1", {
//     headers: {
//       Authorization: "563492ad6f91700001000001ae55374e0f4e4540bc64e5febd464a69"
//     }
//   })
//     .then((resp) => resp.json())
//     .then((res) => {
//       // insertVideo(res?.src?.video_files[0].link);
//       insertVideo(res?.videos[0].video_files[0].link);
//     })
//     .catch(() => {
//       error();
//     });
// }

// function insertVideo(src) {
//   var video = document.getElementById("myVideo");
//   var source = document.createElement("source");
//   source.setAttribute("src", src);
//   video.appendChild(source);
//   video.play();
// }

const cacheBg = 'cache_bg'
function setImage(url: string) {
  main.value.style.backgroundImage = `url(${url})`
}

async function bg() {
  const bg = localStorage.getItem(cacheBg)
  if (bg) {
    setImage(bg)
    getImageBase64().then((data: string) => localStorage.setItem(cacheBg, data))
  } else {
    const data = await getImageBase64()
    setImage(data)
    getImageBase64().then((data: string) => localStorage.setItem(cacheBg, data))
  }
}

function getClipboard() {
  var pasteTarget = document.createElement("div");
  pasteTarget.style.position = 'absolute'
  pasteTarget.style.left = '-9999px'
  pasteTarget.style.right = '-9999px'
  pasteTarget.contentEditable = true;
  var actElem = document.activeElement.appendChild(pasteTarget).parentNode;
  pasteTarget.focus();
  document.execCommand("Paste", null, null);
  var paste = pasteTarget.innerText;
  actElem.removeChild(pasteTarget);
  return paste;
};

const showDialog = ref(false)
const dialogProps = ref({})
async function clipboard() {
  let text = getClipboard()
  console.log(text)
  try {
    const data = JSON.parse(text)
    showDialog.value = true
    dialogProps.value = {
      data: data
    }
  } catch (e) { }
}

const main = ref()

onMounted(async () => {
  // search.value.focus()
  await bg()
  // clipboard().then()
  // setTimeout(clipboard, 500);
  // fetchVideo()
  // pexelsVideo()
})

</script>

<style lang="scss">
.main {
  padding: 20px;
  height: 100%;
  background: linear-gradient(220.55deg, #5D85A6 0%, #0E2C5E 100%);
  background-size: 'cover';
  background-repeat: 'no-repeat';
  // width: 100%;
  // height: 100vh;
}

.el-dropdown-link {
  cursor: pointer;
  color: var(--el-color-primary);
  display: flex;
  align-items: center;
}

#myVideo {
  position: fixed;
  right: 0;
  bottom: 0;
  min-width: 100%;
  min-height: 100%;
}

.search {
  display: block;
  width: 600px;
  height: 30px;
  margin: 100px auto;
  line-height: 60px;
  border-radius: 20px;
  padding: 10px;
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.6);
  font-size: 20px;
}

.search:focus {

  border: 1px solid green;
}
</style>