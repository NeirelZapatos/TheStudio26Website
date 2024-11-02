const Footer2 = () => {
    return (
        <>
    <footer className="footer bg-base-200 text-base-content p-10 py-6 fixed inset-x-0 bottom-0">
      <nav>
        <h6 className="footer-title">Location</h6>
        <a className="link link-hover">
          4100 Cameron Park Drive,<br />
          Suite 118 Cameron Park, <br />
          CA 95682
        </a>
      </nav>
      <nav>
        <h6 className="footer-title">Email</h6>
        <a className="link link-hover">TheStudio26@gmail.com</a>
      </nav>
      <nav>
        <h6 className="footer-title">Phone Number</h6>
        <a className="link link-hover">916-350-0546</a>
      </nav>
      <form>
        <h6 className="footer-title">Newsletter</h6>
        <fieldset className="form-control w-80">
          <label className="label">
            <span className="label-text">Enter your email address</span>
          </label>
          <div className="join">
            <input
              type="text"
              placeholder="username@site.com"
              className="input input-bordered join-item" />
            <button className="btn btn-primary join-item">Subscribe</button>
          </div>
        </fieldset>
      </form>
    </footer>
    </>
  );
}

export default Footer2;