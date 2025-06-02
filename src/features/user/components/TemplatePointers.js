import { useAuth } from '../../../context/AuthContext';

function TemplatePointers() {
    const { userRole } = useAuth();

    const roleContent = {
        ADMIN: {
            greeting: "Welcome Back, Administrator",
            quote: "With great power comes great responsibility.What will you accomplish today?",
            description: "Your admin dashboard gives you complete system control. Monitor performance, manage users, and oversee all operations from one central hub.",
            callToAction: "Take control of your platform!"
        },
        MANAGER: {
            greeting: "Welcome Back, Project Manager",
            quote: "Leadership is the capacity to translate vision into reality.What project milestones await today?",
            description: "Your project management console provides everything you need to plan, track, and deliver successful projects on time and within budget.",
            callToAction: "Ready to manage your projects!"
        }
    };

    const content = roleContent[userRole] || {
        greeting: `Welcome Back, ${userRole}`,
        quote: "Great things are achieved step by step. What incredible milestone will you accomplish today?",
        description: `Your dashboard is ready. Let's get started with your tasks!`,
        callToAction: "Let's begin the journey!"
    };

    return (
        <div className="w-full flex flex-col items-center justify-center pt-4 pb-6">
            <h1 className="text-4xl font-extrabold tracking-wide text-center text-orange-600">
                🚀 {content.greeting}
            </h1>
            <p className="mt-2 text-lg italic text-center text-gray-700 opacity-90">
                {content.quote} 🔥
            </p>
            <div className="mt-3 text-center space-y-2 text-gray-600">
                <p className="text-lg">
                    {content.description} ⚡
                </p>
                <p className="text-lg">
                    {content.callToAction} 🎯
                </p>
            </div>
        </div>
    );
}

export default TemplatePointers;