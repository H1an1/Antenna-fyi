import { RedesignHomepage } from "./components/RedesignHomepage";

export default function Home() {
  return (
    <>
      <noscript>
        <article>
          <h1>Antenna — agent-native social layer for real-world connection</h1>
          <p>
            Your agent knows who you should meet. Antenna gives people an
            agent-readable identity card and helps agents turn context into
            real-world human connection.
          </p>
          <p>
            You can share a profile directly, or join a room created by a host.
            In both cases, agents read context and explain why a connection
            matters.
          </p>
        </article>
      </noscript>
      <RedesignHomepage />
    </>
  );
}
