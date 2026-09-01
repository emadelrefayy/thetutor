{/* Game Runtime */}
        <Route
          path="/games/:scope/:gameId"
          element={
            <ProtectedCurriculumRoute>
              <GameRuntimePage />
            </ProtectedCurriculumRoute>
          }
        />