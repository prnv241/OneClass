import React, { Component } from "react";
import io from "socket.io-client";
import Peer from 'peerjs';
import { Button } from "@material-ui/core";

export class livePage extends Component {
    componentDidMount() {
        const socket = io("/");
        const videoGrid = document.getElementById("video-grid");
        const myVideo = document.createElement("video");
        const showChat = document.querySelector("#showChat");
        myVideo.muted = true;

        showChat.addEventListener("click", () => {
            document.querySelector(".main__right").style.display = "flex";
            document.querySelector(".main__right").style.flex = "1";
            document.querySelector(".main__left").style.display = "none";
            document.querySelector(".header__back").style.display = "block";
        });

        const user = prompt("Enter your name");
        var peer = new Peer(undefined, {
            host: "https://dry-mountain-75053.herokuapp.com",
            path: "/peerjs"
        });

        let myVideoStream;
        navigator.mediaDevices
        .getUserMedia({
            audio: true,
            video: true,
        })
        .then((stream) => {
            myVideoStream = stream;
            addVideoStream(myVideo, stream);

            peer.on("call", (call) => {
                console.log("ANS")
                call.answer(stream);
                const video = document.createElement("video");
                call.on("stream", (userVideoStream) => {
                    addVideoStream(video, userVideoStream);
                });
            });

            socket.on("user-connected", (userId) => {
                connectToNewUser(userId, stream);
            });
        });

        const connectToNewUser = (userId, stream) => {
            const call = peer.call(userId, stream);
            const video = document.createElement("video");
            call.on("stream", (userVideoStream) => {
                addVideoStream(video, userVideoStream);
            });
        };

        socket.on('connect', ()=> {
            console.log("SOC CON");
        })

        peer.on("open", (id) => {
            console.log("OPEN")
            socket.emit("join-room", this.props.match.params.id, id, user);
        });

        const addVideoStream = (video, stream) => {
            video.srcObject = stream;
            video.addEventListener("loadedmetadata", () => {
                video.play();
                videoGrid.append(video);
            });
        };

        let text = document.querySelector("#chat_message");
        let send = document.getElementById("send");
        let messages = document.querySelector(".messages");

        send.addEventListener("click", (e) => {
            if (text.value.length !== 0) {
                socket.emit("message", text.value);
                text.value = "";
            }
        });

        text.addEventListener("keydown", (e) => {
            if (e.key === "Enter" && text.value.length !== 0) {
                socket.emit("message", text.value);
                text.value = "";
            }
        });

        const inviteButton = document.querySelector("#inviteButton");
        const muteButton = document.querySelector("#muteButton");
        const stopVideo = document.querySelector("#stopVideo");
        muteButton.addEventListener("click", () => {
            const enabled = myVideoStream.getAudioTracks()[0].enabled;
            if (enabled) {
                myVideoStream.getAudioTracks()[0].enabled = false;
                muteButton.innerHTML = `<i class="fas fa-microphone-slash"></i>`;
                muteButton.classList.toggle("background__red");
            } else {
                myVideoStream.getAudioTracks()[0].enabled = true;
                muteButton.innerHTML = `<i class="fas fa-microphone"></i>`;
                muteButton.classList.toggle("background__red");
            }
        });

        stopVideo.addEventListener("click", () => {
        const enabled = myVideoStream.getVideoTracks()[0].enabled;
        if (enabled) {
            myVideoStream.getVideoTracks()[0].enabled = false;
            stopVideo.innerHTML = `<i class="fas fa-video-slash"></i>`;
            stopVideo.classList.toggle("background__red");
        } else {
            myVideoStream.getVideoTracks()[0].enabled = true;
            stopVideo.innerHTML = `<i class="fas fa-video"></i>`;
            stopVideo.classList.toggle("background__red");
        }
        });

        inviteButton.addEventListener("click", (e) => {
            prompt(
                "Copy this link and send it to people you want to meet with",
                window.location.href
            );
        });

        socket.on("createMessage", (message, userName) => {
        messages.innerHTML =
            messages.innerHTML +
            `<div class="message">
                <b><i class="far fa-user-circle"></i> <span> ${
                userName === user ? "me" : userName
                }</span> </b>
                <span>${message}</span>
            </div>`;
        });
    }

    render() {
        return (
            <div className="main">  
                <div className="main__left">
                    <div className="videos__group">
                        <div id="video-grid">

                        </div>
                    </div>
                <div className="options">
                    <div className="options__left">
          <div id="stopVideo" className="options__button">
            <i className="fa fa-video-camera"></i>
          </div>
          <div id="muteButton" className="options__button">
            <i className="fa fa-microphone"></i>
          </div>
          <div id="showChat" className="options__button">
            <i className="fa fa-comment"></i>
          </div>
        </div>
        <div className="options__right">
          <div id="inviteButton" className="options__button">
            <i className="fas fa-user-plus"></i>
          </div>
        </div>
      </div>
    </div>
    <div className="main__right">
      <div className="main__chat_window">
          <div className="messages">

          </div>
      </div>
      <div className="main__message_container">
        <input id="chat_message" type="text" autoComplete="off" placeholder="Type message here..."></input>
        <div id="send" className="options__button">
          <i className="fa fa-plus" aria-hidden="true"></i>
        </div>
      </div>
    </div>
    <script src="https://kit.fontawesome.com/c939d0e917.js"></script>
    </div>
        );
    }
}

export default livePage;