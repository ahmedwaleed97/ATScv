import React, { useState } from "react";
import Home from "./components/Home";
import Builder from "./components/Builder";
import Checker from "./components/Checker";
import CVSheet from "./components/CVSheet";
import { sampleCV } from "./data/cv";

export default function App() {
  const [view, setView] = useState("home");
  const [cv, setCV] = useState(sampleCV);

  return (
    <div className="cvb-root">
      {view === "home" && (
        <Home onStart={() => setView("builder")} onCheck={() => setView("checker")} />
      )}
      {view === "builder" && (
        <Builder cv={cv} setCV={setCV} onHome={() => setView("home")} />
      )}
      {view === "checker" && (
        <Checker onHome={() => setView("home")} onBuild={() => setView("builder")} />
      )}
      <div className="print-source" aria-hidden="true">
        <CVSheet cv={cv} />
      </div>
    </div>
  );
}
