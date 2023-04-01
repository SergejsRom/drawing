<script setup>
import DrawBrush from '../components/DrawBrush.vue'
import DrawCircle from '../components/DrawCircle.vue'
import DrawRect from '../components/DrawRect.vue'
</script>

<template>
  <main>
    <div ref="canvas_width" class="main_div">
      <!-- <button class="button">Save</button>
      <button @click="Restore()" class="button">Trim last</button>
      <button @click="Clear()" class="button">Clear Drawing</button> -->
      <input type="color" v-model="color" @change="updateColor" class="button padding_0 pointer" />
      <input
        type="number"
        v-model.number="elementWidth"
        min="1"
        max="50"
        @change="updateElementWidth"
        class="pointer"
      />

      <button @click="undo" class="button">Undo</button>
      <button @click="redo" class="button">Redo</button>
      <button @click="save" class="button">Save</button>
      <button @click="clearCanvas" class="button">Clear</button>

      <DrawBrush @click="activateBrush" class="pointer" />
      <DrawCircle @click="activateCircle" class="pointer" />
      <DrawRect @click="activateRectangle" class="pointer" />
    </div>
    <canvas
      ref="canvas"
      @mousedown="startDrawing"
      @mousemove="draw"
      @mouseup="stopDrawing"
      class="canvas"
    >
    </canvas>
  </main>
</template>

<style scoped>
.canvas {
  /* width: 100%;
  height: 85vh; */
  border-radius: 0 0 0.5rem 0.5rem;
  border: 2px solid lightgrey;
  border-top: none;
}
.main_div {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  width: 100%;
  top: 10px;
  padding: 5px;
  background-color: whitesmoke;
  border-radius: 0.5rem 0.5rem 0 0;
  border: 2px solid lightgrey;
}
.stroke-color {
  border-radius: 50%;
  width: 30px;
  height: 30px;
}

.button {
  padding: 5px 10px;
  border-radius: 0.5rem;
  border: 2px solid var(--color-border);
  background-color: white;
  cursor: pointer;
  font-size: 14px;
  text-align: center;
  color: rgb(94, 92, 92);
}
main button:hover {
  background-color: hsla(160, 100%, 37%, 0.2);
}

template {
  font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu,
    Cantarell, 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
  font-size: 15px;
}

.padding_0 {
  padding: 0;
  height: 30px;
}

.pointer {
  cursor: pointer;
}
</style>

<script>
export default {
  data() {
    return {
      canvas: null,
      ctx: null,
      isDrawing: false,
      drawingType: 'brush',
      color: '#000000',
      elementWidth: 5,
      undoStack: [],
      redoStack: []
    }
  },
  mounted() {
    this.canvas = this.$refs.canvas
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true })
    this.canvas.width = this.$refs.canvas_width.offsetWidth
    this.canvas.height = window.innerHeight * 0.7
    this.ctx.fillStyle = 'white'
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
  },
  methods: {
    startDrawing(event) {
      this.isDrawing = true
      this.undoStack.push(this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height))
      switch (this.drawingType) {
        case 'rectangle':
          this.startRect = { x: event.offsetX, y: event.offsetY }
          break
        case 'circle':
          this.startCircle = { x: event.offsetX, y: event.offsetY }
          break
      }
    },
    draw(event) {
      if (!this.isDrawing) return
      switch (this.drawingType) {
        case 'brush':
          this.drawBrush(event)
          break
        case 'rectangle':
          this.drawRectangle(event)
          break
        case 'circle':
          this.drawCircle(event)
          break
      }
    },
    stopDrawing(event) {
      this.isDrawing = false
      switch (this.drawingType) {
        case 'rectangle':
          this.drawRectangle(event)
          break
        case 'circle':
          this.drawCircle(event)
          break
      }
      this.redoStack = []
    },

    drawBrush(event) {
      this.ctx.strokeStyle = this.color
      this.ctx.lineWidth = this.elementWidth
      this.ctx.beginPath()
      this.ctx.lineCap = 'round'
      this.ctx.moveTo(event.offsetX, event.offsetY)
      this.ctx.lineTo(event.offsetX, event.offsetY)
      this.ctx.stroke()
    },

    drawRectangle(event) {
      const rect = {
        x: Math.min(event.offsetX, this.startRect.x),
        y: Math.min(event.offsetY, this.startRect.y),
        width: Math.abs(event.offsetX - this.startRect.x),
        height: Math.abs(event.offsetY - this.startRect.y)
      }
      this.clearCanvas()
      this.ctx.putImageData(this.undoStack[this.undoStack.length - 1], 0, 0)
      this.ctx.strokeStyle = this.color
      this.ctx.lineWidth = this.elementWidth
      this.ctx.strokeRect(rect.x, rect.y, rect.width, rect.height)
    },
    drawCircle(event) {
      const circle = {
        x: this.startCircle.x,
        y: this.startCircle.y,
        r: Math.sqrt(
          (event.offsetX - this.startCircle.x) ** 2 + (event.offsetY - this.startCircle.y) ** 2
        )
      }
      this.clearCanvas()
      this.ctx.putImageData(this.undoStack[this.undoStack.length - 1], 0, 0)
      this.ctx.strokeStyle = this.color
      this.ctx.lineWidth = this.elementWidth
      this.ctx.beginPath()
      this.ctx.arc(circle.x, circle.y, circle.r, 0, 2 * Math.PI)
      this.ctx.stroke()
    },
    activateBrush() {
      this.drawingType = 'brush'
    },
    activateRectangle() {
      this.drawingType = 'rectangle'
    },
    activateCircle() {
      this.drawingType = 'circle'
    },
    updateColor(event) {
      this.color = event.target.value
    },
    updateElementWidth(event) {
      this.elementWidth = event.target.value
    },
    undo() {
      if (this.undoStack.length > 1) {
        this.redoStack.push(this.undoStack.pop())
        this.clearCanvas()
        this.ctx.putImageData(this.undoStack[this.undoStack.length - 1], 0, 0)
      }
    },
    redo() {
      if (this.redoStack.length > 0) {
        this.clearCanvas()
        this.ctx.putImageData(this.redoStack.pop(), 0, 0)
        this.undoStack.push(this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height))
      }
    },
    save() {
      const link = document.createElement('a')
      link.download = 'drawing.png'
      link.href = this.canvas.toDataURL('image/png')
      link.click()
    },
    clearCanvas() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
      this.ctx.fillStyle = 'white'
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
    }
  }
}
</script>

<!-- <style>
.drawing-app {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.drawing-tools {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 10px;
}
canvas {
  border: 1px solid black;
}
</style> -->
