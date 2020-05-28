import * as Surplus from 'surplus';
import S from 's-js';

S.root(() => {
  document.body.appendChild(
      <header>
        <h1>Ibiyemi Abiodun</h1>
        <button id="theme-toggle">Switch theme</button>
      </header>
  );

  document.body.appendChild(
      <main>
        <h2>Hi!</h2>
        <p>
        I'm a rising sophomore at Cornell, double majoring in electrical & computer engineering, and
        computer science. I love cooking & baking, karate, VFX, cinematography, and of course,
        coding.
        </p>
        <p>
        I was born in Nigeria, and I've lived all over the U.S., although when people ask I tell
        them
        I'm from Seattle because I lived in Bellevue & Kirkland for about 9 years of my 19-year
        life.
        </p>
        <h2>Coding</h2>
        <p>
        You want my resume? <a href="/dl/resume.pdf">Here you go</a>.
        </p>
        <h2>Cooking</h2>
        <p>
        I know, we're in quarantine, everyone is cooking and baking. But look at this:
        </p>

      </main>);

  document.body.appendChild(
      <footer>
        <p>© 2020 Google, Inc.</p>
        <p>Because this stuff isn't owned by <em>me</em>...</p>
      </footer>
  );
});
