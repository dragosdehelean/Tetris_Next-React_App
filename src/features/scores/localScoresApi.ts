import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import type { Difficulty } from "@/features/game/types";
import { readScores, writeScore } from "@/features/scores/localScores";
import type { ScoreEntry, ScoreList } from "@/features/scores/types";

export const localScoresApi = createApi({
  reducerPath: "localScoresApi",
  baseQuery: fakeBaseQuery(),
  tagTypes: ["Scores"],
  endpoints: (builder) => ({
    getScores: builder.query<ScoreList, Difficulty>({
      queryFn: async (difficulty) => ({ data: readScores(difficulty) }),
      providesTags: (_result, _err, arg) => [{ type: "Scores", id: arg }],
    }),
    addScore: builder.mutation<ScoreList, ScoreEntry>({
      queryFn: async (entry) => ({ data: writeScore(entry) }),
      invalidatesTags: (_res, _err, arg) => [{ type: "Scores", id: arg.difficulty }],
    }),
  }),
});

export const { useGetScoresQuery, useAddScoreMutation } = localScoresApi;

