import { useMemo, useState } from 'react'
import * as Tone from "tone"


interface ToneButtonProps {
   synth: Tone.Synth;
}

const ToneButton = ({synth} : ToneButtonProps) =>{
   const [count, setCount] = useState(0);
   
   const handleClick = async() => {
      await Tone.start();
      synth.triggerAttackRelease("C4", "8n");
      setCount(count + 1);
   }

   return (
      <button className="bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 active:bg-blue-800 transition" 
              onClick={handleClick}>
      ♫ played count: {count}
      </button>
   )
}

function App() {
   // App-wide synth, only want 1
   const synth = useMemo(() => new Tone.Synth().toDestination(), []);

   return (
      <main className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
         <h1 className='text-3xl font-bold text-gray-800'>Press Me</h1>
         <ToneButton synth={synth}/>
      </main>
   )
}

export default App
