import { ChangeEvent, useState } from "react"
import { Appbar } from "../components/Appbar"
import axios from "axios"
import { BACKEND_URL } from "../config"
import { useNavigate } from "react-router-dom"



export const Publish = () => {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const navigate = useNavigate();

    return <div>
        <Appbar />
        <div>
            <div className="max-w-screen lg-4 px-10 pt-8">
                <input onChange={(e)=>{
                    setTitle(e.target.value)
                }}
                    type="text" placeholder="Title" className="block w-full p-4 text-gray-900 rounded-lg" />
                <TextEditor 
                onChange ={(e) =>{
                    setContent(e.target.value)
                }}/>
                <button onClick={async()=>{
                    const response = await axios.post(`${BACKEND_URL}/api/v1/blogs/create-post`, {
                        title,
                        content, 
                    }, {
                        headers : {
                            Authorization: `Bearer ${localStorage.getItem("token")}`
                        }
                    });
                    navigate(`/blog/${response.data.post.id}`)
                }} type="button" className="mr-4 text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-full text-sm px-5 py-1 text-center me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700">Publish</button>
            </div>
        </div>
    </div>
}


function TextEditor({onChange}: {onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void}) {
    return <div>
        <div className="w-full mb-4 mt-2">
            <textarea onChange={onChange} className="h-52 py-3 px-4 block w-full border-gray-200 rounded-lg text-sm " placeholder="Tell you story..."></textarea>
        </div>
    </div>
}