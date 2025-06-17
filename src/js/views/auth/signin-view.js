import SigninPresenter from "../../presenters/signin-presenter";

class SigninView {
  #presenter = null;

  constructor() {
    this.#presenter = new SigninPresenter(this);
  }

  async render() {
    return `
      <section id="main-content" class="auth">
        <h1 class="auth__title"> Sign In</h1>
        
        <form id="signinForm" class="auth__form">
          <div class="form-group">
            <label for="name"> Name</label>
            <input type="text" id="name" name="name" required>
          </div>

          <div class="form-group">
            <label for="email"> Email</label>
            <input type="email" id="email" name="email" required>
          </div>
          
          <div class="form-group">
            <label for="password"> Password</label>
            <input 
              type="password" 
              id="password" 
              name="password" 
              required 
              minlength="8"
              pattern="^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d]{8,}$"
              title="The password must be at least 8 characters long and contain both letters and numbers"
            >
            <small class="form-help"><i class="fa-solid fa-circle-exclamation"></i> Min 8 characters, must include letters and numbers</small>
          </div>
          
          <button type="submit" class="submit-button">Register</button>
          
          <p class="auth__link">
            <i class="fas fa-sign-in-alt"></i> Already have an account? <a href="#/login">Log in here</a>
          </p>
        </form>
      </section>
    `;
  }

  async afterRender() {
    const signinForm = document.getElementById("signinForm");

    signinForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = new FormData(signinForm);
      await this.#presenter.signin(formData);
    });
  }
}

export default SigninView;
