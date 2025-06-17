export default class HomeView {
  async render() {
    return `
        <section id="main-content" class="container">
            <div class="home-content">
                <h1 class="home-title">Welcome to Dicoding Story</h1>
                    
                    <div class="home-description">
                    <p>Dicoding Story is a platform that allows you to share your special moments and discover the stories of others. Join the community and create unforgettable memories!</p>
                    
                    <h2>Your Story Begins Here</h2>
                    <div class="home-story">
                        <p>Imagine capturing the essence of your most unforgettable moment. Whether it's a beautiful sunset, an exciting trip, or a simple joyful gathering, Dicoding Story lets you capture that memory with your phone camera. You can snap a picture directly or upload an image from your gallery, ensuring every detail is preserved.</p>
                        
                        <p>Once you've captured your moment, it's time to add a personal touch. Mark the exact location on the interactive map, so your friends and followers know where your story unfolded. Whether it's a local cafe, a faraway destination, or even your backyard, the location pin will bring your story to life.</p>

                        <p>But that's not all. Dicoding Story also lets you explore the stories of others. Discover new places, adventures, and emotions as you read through the stories shared by people from all over the world. You never know what might inspire you!</p>
                        
                        <p>Finally, once you've created your story, feel free to share it with others. Let your moments spread and be a part of a community that celebrates each other's experiences. Whether it's a memory with friends or a solo adventure, sharing is what makes your story complete.</p>
                    </div>

                    <div class="cta-container">
                        <a href="#/story" class="cta-button">
                         Explore Stories
                        </a>
                    </div>
                </div>
            </div>
        </section>
      `;
  }

  async afterRender() {
    // Nothing to initialize now that notification toggle has been moved
  }
}
