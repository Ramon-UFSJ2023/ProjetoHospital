import React from "react";
import "./profilemenu.css"


export default function ProfileMenu(){

    return(
        <main className="profile-menu-overlay fixed inset-0 w-screen h-screen bg-gray-400 z-40" onClick={onclose}>
            <div className="profile-menu-container" onClick={(e) => e.stopPropagation()}>
                
            </div>
        </main>
    );
}