import React from 'react'
import { Github, Linkedin, Mail } from 'lucide-react'
import { FaWhatsapp, FaTelegramPlane } from 'react-icons/fa'

export default function SocialBar(){
  return (
    <div className="social-bar hidden md:flex gap-3">
      {}
      <a 
        href="https://github.com/StefanoAbate27" 
        target="_blank" 
        rel="noopener noreferrer"
        className="bg-white p-3 rounded-full shadow hover:scale-110 transition hover:shadow-lg hover:shadow-gray-500"
      >
        <Github className="text-black" />
      </a>

      {}
      <a 
        href="https://www.linkedin.com/in/stefano-abate-75b362345" 
        target="_blank" 
        rel="noopener noreferrer"
        className="bg-white p-3 rounded-full shadow hover:scale-110 transition hover:shadow-lg hover:shadow-blue-500"
      >
        <Linkedin className="text-black" />
      </a>

      {}
      <a 
        href="mailto:stefanoabate2002@gmail.com"
        className="bg-white p-3 rounded-full shadow hover:scale-110 transition hover:shadow-lg hover:shadow-red-500"
      >
        <Mail className="text-black" />
      </a>

      {}
      <a 
        href="https://wa.me/584247582675" 
        target="_blank" 
        rel="noopener noreferrer"
        className="bg-white p-3 rounded-full shadow hover:scale-110 transition hover:shadow-lg hover:shadow-green-500"
      >
        <FaWhatsapp className="text-black" size={20} />
      </a>

      {}
      <a 
        href="https://t.me/StefanoA1227" 
        target="_blank" 
        rel="noopener noreferrer"
        className="bg-white p-3 rounded-full shadow hover:scale-110 transition hover:shadow-lg hover:shadow-sky-500"
      >
        <FaTelegramPlane className="text-black" size={20} />
      </a>
    </div>
  )
}
