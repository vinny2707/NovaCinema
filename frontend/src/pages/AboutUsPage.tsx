// src/pages/AboutUsPage.tsx
import { Users, Heart, Code, Sparkles } from 'lucide-react';

interface TeamMember {
    id: number;
    name: string;
    role: string;
    avatar: string;
    bio: string;
}

const teamMembers: TeamMember[] = [
    {
        id: 1,
        name: "Hồ Quang Sang",
        role: "Backend Developer",
        avatar: "/1.png",
        bio: "Responsible for building APIs, handling business logic, and optimizing server-side performance."
    },
    {
        id: 2,
        name: "Nguyễn Khắc Vượng",
        role: "Frontend Developer",
        avatar: "/2.jpg",
        bio: "Focused on developing modern, user-friendly interfaces with smooth user experiences."
    },
    {
        id: 3,
        name: "Trần Quốc Vỹ",
        role: "Frontend Developer",
        avatar: "/3.jpg",
        bio: "Implementing UI/UX designs and ensuring responsive, cross-device compatibility."
    },
    {
        id: 4,
        name: "Nguyễn Thanh Phương",
        role: "Tester",
        avatar: "/4.jpg",
        bio: "Conducting testing, identifying bugs, and ensuring overall product quality."
    }
];

export default function AboutUsPage() {
    return (
        <div className="min-h-screen bg-[#0A0E27] py-16">
            <div className="container mx-auto max-w-7xl px-4">
                {/* Header Section */}
                <div className="text-center mb-16">
                    <div className="flex justify-center mb-6">
                        <div className="bg-yellow-400/10 p-4 rounded-full">
                            <Users className="w-12 h-12 text-yellow-400" />
                        </div>
                    </div>
                    <h1
                        className="text-5xl md:text-6xl font-bold text-white uppercase tracking-wide mb-4"
                        style={{ fontFamily: 'Anton, sans-serif' }}
                    >
                        About Us
                    </h1>
                    <p className="text-gray-400 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
                        We are a passionate team of developers dedicated to bringing you the best movie experience.
                        Our mission is to make discovering and enjoying films easier than ever.
                    </p>
                </div>

                {/* Mission & Vision Cards */}
                <div className="grid md:grid-cols-3 gap-6 mb-20">
                    <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50 hover:border-yellow-400/50 transition-all duration-300">
                        <div className="bg-yellow-400/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                            <Heart className="w-6 h-6 text-yellow-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Our Mission</h3>
                        <p className="text-gray-400">
                            To create an exceptional platform that connects movie lovers with their favorite films.
                        </p>
                    </div>

                    <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50 hover:border-purple-400/50 transition-all duration-300">
                        <div className="bg-purple-400/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                            <Code className="w-6 h-6 text-purple-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Our Technology</h3>
                        <p className="text-gray-400">
                            Built with modern technologies: React, TypeScript, Node.js, and MongoDB.
                        </p>
                    </div>

                    <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50 hover:border-pink-400/50 transition-all duration-300">
                        <div className="bg-pink-400/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                            <Sparkles className="w-6 h-6 text-pink-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Our Vision</h3>
                        <p className="text-gray-400">
                            To become the go-to platform for movie enthusiasts across Vietnam.
                        </p>
                    </div>
                </div>

                {/* Team Section */}
                <div className="mb-12">
                    <h2
                        className="text-4xl font-bold text-white text-center uppercase tracking-wide mb-4"
                        style={{ fontFamily: 'Anton, sans-serif' }}
                    >
                        Meet Our Team
                    </h2>
                    <p className="text-gray-400 text-center mb-12">
                        The talented people behind NovaCinema
                    </p>

                    {/* Team Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {teamMembers.map((member) => (
                            <div
                                key={member.id}
                                className="group relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-700/50 hover:border-yellow-400/50 transition-all duration-300 hover:transform hover:scale-105"
                            >
                                {/* Avatar */}
                                <div className="relative overflow-hidden">
                                    <div className="aspect-square bg-gradient-to-br from-gray-700 to-gray-800">
                                        <img
                                            src={member.avatar}
                                            alt={member.name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                        />
                                    </div>
                                    {/* Overlay on hover */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                </div>

                                {/* Info */}
                                <div className="p-6 text-center">
                                    <h3 className="text-xl font-bold text-white mb-1">
                                        {member.name}
                                    </h3>
                                    <p className="text-yellow-400 text-sm font-semibold mb-3">
                                        {member.role}
                                    </p>
                                    <p className="text-gray-400 text-sm leading-relaxed">
                                        {member.bio}
                                    </p>
                                </div>

                                {/* Decorative element */}
                                <div className="absolute top-4 right-4 w-2 h-2 bg-yellow-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Contact CTA */}
                <div className="mt-20 text-center bg-gradient-to-r from-yellow-400/10 to-purple-400/10 rounded-2xl p-12 border border-yellow-400/20">
                    <h3 className="text-3xl font-bold text-white mb-4">
                        Want to get in touch?
                    </h3>
                    <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
                        We'd love to hear from you! Whether you have questions, feedback, or just want to say hi.
                    </p>
                    <a
                        href="mailto:contact@novacinema.com"
                        className="inline-block bg-yellow-400 text-gray-900 px-8 py-3 rounded-lg font-bold hover:bg-yellow-300 transition-colors duration-300"
                    >
                        Contact Us
                    </a>
                </div>
            </div>
        </div>
    );
}
