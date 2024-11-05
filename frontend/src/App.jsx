import { useEffect, useState, useRef } from 'react';
import './App.css'
import { io} from "socket.io-client"



function App() {

  const socket  = io("http://localhost:8000");
 
  const [ Stream, setStream] = useState("");

  const [ name, setName] = useState("");
  const [ user, setUser] = useState("");

  const [ allUsers, setAllUsers] = useState([]);
  const [ isJoin, setIsJoin] = useState(false);

  //localStream Ref
  const localStreamRef = useRef(null);

  //remoteStream Ref
  const remoteStreamRef = useRef(null);
  
  //peer connection ref
  const peerConnectionRef = useRef(new RTCPeerConnection({ 
    iceServers: [{ urls: "stun:stun.l.google.com:19302"}]
  }));

  //--------------------------------------------------
  useEffect(()=>{
    socket.on("connect",( socket)=>{
      console.log("connection Successfull");
    })
   
  },[]);

  //--------------------------------------------------
  //enter username
  const handleCreate = ( e) =>{

    if(name.trim()){
      socket.emit("join-user", name);
      setIsJoin(true);
      setUser(name);
    }

    setName("");
  }

  //--------------------------------------------------
  //reveive message to know who are joined
  const joinEvent = ( users)=>{
     
    setAllUsers(users);
  }

  useEffect(()=>{
    socket.on("joined", joinEvent);

    return ()=>{
      socket.off("joined",joinEvent);
    }
  },[socket]);
  

  const handleCallStart = ( callName)=>{
    console.log( {callName});
  }

  //get video function
  async function getMyVideo(){
    const stream = await navigator?.mediaDevices?.getUserMedia({ audio: true, video: true });
    if(localStreamRef.current){
       localStreamRef.current.srcObject = stream;
       setStream(stream);
    }
  }

  function closeVideo(){
    setStream(null);
  }

  //start call method
    async function startCall(user){
      try{
        console.log("user : ",user);
      const offer = await peerConnectionRef.current.createOffer();
      const ogg = await peerConnectionRef.current.setLocalDescription(offer);
      console.log("+++++==== ",ogg)
      }
      catch(err){
        console.log(err)
      }
      
    }

  
  useEffect(()=>{
    async function getMedia(){
    try{

      //--------------------------------------------------
      // (1).add local stream to peer connection
      // initialize app
      getMyVideo();

      //--------------------------------------------------
      // (2).make peer connection, add localtracks to peer connection 
      const configuration = { 
        iceServers: [{ urls: "stun:stun.l.google.com:19302"}]
      };

        //Create Peer Connection
      // peerConnectionRef.current = new RTCPeerConnection({ 
      //   iceServers: [{ urls: "stun:stun.l.google.com:19302"}]
      // });

        //add local tracks to the peer connection
     
        console.log("****",Stream.getTracks())
        Stream.getTracks().forEach((track)=>{
         
          peerConnectionRef.current.addTrack(track, Stream);
        });

      //--------------------------------------------------
      // (3). listen for remote tracks, remote Stream and add to peer connection
      
        peerConnectionRef.current.ontrack = (e)=>{
          remoteStreamRef.srcObject = e.streams[0];
        
        }

        //listen for ice candidate
        // peerConnectionRef.current.onicecandidate
        await startCall();

        
       

    }
    catch(err){
      console.log(err);
    }

  }
  // getMedia();
    

    return ()=>{
      closeVideo();
    }

  },[]);
  console.log(peerConnectionRef);

  

  

  return (
    <>
    {/* all users */}
  
    <div style={{border:"1px solid red", display:"flex"}}>
    {
      allUsers?.map(( User)=>{
        return (
            <div>
              <button onClick={(e)=>{handleCallStart(User.username)}}
              style={{border: user===User.username ? "2px solid black" : "3px solid green", marginLeft:"30px", padding:"10px", borderRadius:"20px", color:"white", backgroundColor: user===User.username ? "green":"black"}}
              >
              { user===User.username ? `${user}(You)` : User.username}</button>    
            </div>
        )
      })
    }  
    </div>

    {/* all UI */}
    <div className="container" style={{width:"100vw", height:"100vh"}}>
      
      <div className="username-input" style={{ margin:"40px"}}>
        <div style={{display: isJoin ? "none": false}}>
        <input type="text" value={name} onChange={(e)=>{ setName( e.target.value)}} placeholder="enter username" style={{width:"20vw", border:"2px solid orange", borderRadius:"5px", padding:"10px", outline:"none"}}/>
        <button style={{ backgroundColor:"green", color:"white"}} onClick={handleCreate}>Create</button>
        </div>
      </div>

      <div style={{ display:"flex", flexDirection:"row", width:"100vw"}}>
        {/* localStreamRef */}
        <div className="local-video" style={{ border:"2px solid blue", width:"50vw", height:"50vh", backgroundColor:"black"}}>
          <video ref={localStreamRef} style={{width:"40vw"}}  autoPlay muted/>
        </div>
        {/*  */}
        <div className="remote-video" style={{ border:"2px solid blue", width:"50vw", height:"50vh", backgroundColor:"black", marginLeft:"20px"}}>
        <video ref={ remoteStreamRef} style={{width:"40vw"}}  autoPlay muted/>
        </div>
      </div>

      <div>
        <button style={{border:"1px solid black",margin:"40px", backgroundColor:"red", color:"white"}}>click me</button>
      </div>

    </div>
    </>
  )
}

export default App
