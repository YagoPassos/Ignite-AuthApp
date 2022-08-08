import { destroyCookie } from "nookies"
import { useContext, useEffect } from "react"
import Can from "../components/Can"
import { AuthContext } from '../contexts/AuthContext'
import { useCan } from "../hooks/useCan"
import { setupAPIClient } from "../services/api"
import { api } from "../services/apiClient"
import { AuthTokenError } from "../services/errors/AuthTokenError"
import { withSSRAuth } from "../utils/withSSRAuth"

export default function Dashboard() {
    const { user } = useContext(AuthContext)

    // const userCanSeeMetrics = useCan({
    //     permissions: ['metrics.list', 'users.create']
    // })

    return (
        <>
            <h1>DASHBOARD: {user?.email}</h1>

            <Can permissions={['metrics.list', 'users.create']}>
                <div>Métricas</div>
            </Can>
            {/* {userCanSeeMetrics && <div>Métricas</div>} */}
        </>

    )
}

export const getServerSideProps = withSSRAuth(async (ctx) => {
    const apiClient = setupAPIClient(ctx)
    const response = await apiClient.get('/me')

    return {
        props: {}
    }
})