<script>
  export let mainImage;
  export let galleryImages;

  // ตั้งค่ารูปแรกที่แสดงเป็นรูปหลัก
  let activeImage = mainImage;

  // ฟังก์ชันสำหรับเปลี่ยนรูปเมื่อคลิก thumbnail
  function setActiveImage(image) {
    activeImage = image;
  }
</script>

<div class="gallery-container">
  <div class="main-image-wrapper">
    <img 
      src="{activeImage.url}?w=1000&h=1000&fit=crop&auto=format" 
      alt={activeImage.alt}
      width="1000"
      height="1000"
    />
  </div>

  {#if galleryImages && galleryImages.length > 0}
    <div class="thumbnail-grid">
      <button class:is-active={activeImage.url === mainImage.url} on:click={() => setActiveImage(mainImage)}>
        <img src="{mainImage.url}?w=120&h=120&fit=crop&auto=format" alt={mainImage.alt} loading="lazy" />
      </button>
      
      {#each galleryImages as image}
        <button class:is-active={activeImage.url === image.url} on:click={() => setActiveImage(image)}>
          <img src="{image.url}?w=120&h=120&fit=crop&auto=format" alt={image.alt} loading="lazy" />
        </button>
      {/each}
    </div>
  {/if}
</div>

<style>
  .gallery-container {
    position: sticky;
    top: 2rem;
  }
  .main-image-wrapper {
    aspect-ratio: 1 / 1;
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid #eee;
  }
  .main-image-wrapper img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .thumbnail-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 0.75rem;
    margin-top: 1rem;
  }
  .thumbnail-grid button {
    aspect-ratio: 1 / 1;
    border-radius: 8px;
    overflow: hidden;
    padding: 0;
    border: 2px solid transparent;
    cursor: pointer;
    transition: border-color 0.2s ease;
  }
  .thumbnail-grid button:hover {
    border-color: #A98C72;
  }
  .thumbnail-grid button.is-active {
    border-color: #6C463E;
  }
  .thumbnail-grid button img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
</style>