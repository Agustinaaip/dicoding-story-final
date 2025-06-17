export default class AboutView {
  async render() {
    return `
  
        <section id="main-content" class="about">
            <div class="about-content" role="main">
                <h1 class="about-title">
                    <i class="fas fa-info-circle" aria-hidden="true"></i> 
                    About Dicoding Story
                </h1>

                <div class="about-description">
                    <p>Dicoding Story is a platform where users can share their personal stories and mark locations on the map. The app allows users to create stories and add locations to make each shared experience more meaningful.</p>
                </div>

                <div class="about-features">
                    <h2>Main Features</h2>
                    <div class="features-grid">
                        <div class="feature-card">
                            <i class="fas fa-pencil-alt" aria-hidden="true"></i>
                            <h3>Write Stories</h3>
                            <p>Share your personal stories with ease and make every moment more vivid.</p>
                        </div>
                        <div class="feature-card">
                            <i class="fas fa-map-marker-alt" aria-hidden="true"></i>
                            <h3>Mark Locations</h3>
                            <p>Add a location to each story you share using an interactive map.</p>
                        </div>
                    </div>
                </div>

                <div class="about-credits">
                    <h2>Developed By</h2>
                    <div class="credits-card">
                        <i class="fas fa-user-circle" aria-hidden="true"></i>
                        <p>Agustina Inka Putri</p>
                        <p class="credits-note">
                        This app was developed as part of the learning process at Dicoding.
                        </p>
                    </div>
                </div>
            </div>
        </section>

      `;
  }

  async afterRender() {}
}
