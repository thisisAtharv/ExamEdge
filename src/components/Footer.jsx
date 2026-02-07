import { BookOpen, Mail, Phone, MapPin, Users } from "lucide-react";

function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-800">ExamEdge</span>
            </div>
            <p className="text-gray-600">
              Empowering UPSC aspirants with comprehensive study materials, interactive quizzes, and personalized learning experiences.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="/about" className="text-gray-600 hover:text-purple-600">About Us</a></li>
              <li><a href="https://epgp.inflibnet.ac.in/Home/ViewSubject?catid=NuAs6SreCGryddEfs4kkBA==" target="_blank" className="text-gray-600 hover:text-purple-600">Study Material</a></li>
              <li><a href= "#" className="text-gray-600 hover:text-purple-600">Back To The Top</a></li>
              
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Contact</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-600">
                <Mail className="w-4 h-4" />
                <span>support@examedge.com</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Phone className="w-4 h-4" />
                <span>+91 56565 43434</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>Mumbai, India</span>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-200 mt-8 pt-8 text-center">
          <p className="text-gray-500">
            © 2025 ExamEdge. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
