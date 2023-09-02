const AuthLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="flex items-center justify-center h-full">
            {children}
        </div>
    )
}

export default AuthLayout

// Creating this file will propagate the layout you want into the "ROUTES" folder

// Top and bottom both are same, its just function vs arrow function.

// export default function AuthLayout({ children }: { children: React.ReactNode }) {
//     return (
//         <div>
//             {children}
//         </div>
//     )
// }