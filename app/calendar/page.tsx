import { StrictMode } from 'react';

const Header = () => (
  <header>
    <h1 className="title flex justify-center p-4">The Studio 26</h1>
    <nav className="flex justify-center">
      <ul className="menu menu-horizontal">
        <li><a>Home</a></li>
        <li><a>Online Store</a></li>
        <li><a>Class Catalog</a></li>
        <li><a>Calendar</a></li>
        <li><a>Open Lab</a></li>
        <li><a>Gift Cards</a></li>
        <li><a>Contact Us</a></li>
      </ul>
    </nav>
  </header>
);

const Footer = () => (
  <footer>
    <p className="flex justify-center"> 4100 Cameron Park Drive, Suite 118</p>
    <p className="flex justify-center min-h-screen"> Cameron Park, CA 95682 </p>
  </footer>
);

export default function Calendar() {
    return (
      <StrictMode>
        <div>
          <Header />
          <main className="flex-grow p-4">
            Body
          </main>
          <Footer />
        </div>
      </StrictMode>
    );
  }
